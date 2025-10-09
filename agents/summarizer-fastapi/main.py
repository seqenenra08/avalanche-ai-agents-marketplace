import os
import hmac
import hashlib
import time
import re
from typing import Any, Dict
from fastapi import FastAPI, Body, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ===== Config =====
AGENT_ID = os.getenv("AGENT_ID", "summarizer-001")
AGENT_VERSION = os.getenv("AGENT_VERSION", "1.0.0")
AGENT_SECRET = os.getenv("AGENT_SECRET", "change-me")  # usado para HMAC signature
API_KEY = os.getenv("API_KEY", None)  # opcional: key para invocar el agente

# CORS abierto por defecto (ajusta dominios en producción)
app = FastAPI(title="Summarizer Agent", version=AGENT_VERSION)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Helpers =====
STOPWORDS = set(
    """
    a al algo algunas algunos ante antes como con contra cual cuales cuando de del desde donde dos e el ella ellas ellos en entre era erais eramos eran es esa esas ese eso esos esta estaba estaban estado estamos estan estar este estos fue fueron ha habiendo han hasta hay la las le les lo los mas me mi mia mientras mio mis mucha muchas mucho muchos muy nada ni no nos nosotras nosotros o para pero poco por porque que quien quienes se sea sean segun ser si siempre sin so sobre su sus te ti tiene todos tu tus un una uno y ya yo the to and or is are was were be been being of in on at by for from with about into through during before after above below up down out off over under again further then once here there when where why how all any both each few more most other some such no nor not only own same so than too very can will just don don t should now i you he she it we they them this that these those am do does did doing having
    """.split()
)

# cache simple por inputHash -> output
CACHE: Dict[str, Dict[str, Any]] = {}


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def normalize_text(t: str) -> str:
    t = re.sub(r"\s+", " ", t.strip())
    return t


def sentence_split(t: str):
    # Split muy simple y determinista por signos de puntuación.
    parts = re.split(r"(?<=[.!?])\s+", normalize_text(t))
    return [s for s in parts if s]


def score_sentence(sent: str) -> float:
    # Scoring por frecuencia de palabras no-stopword (determinista)
    tokens = re.findall(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9]+", sent.lower())
    tokens = [w for w in tokens if w not in STOPWORDS]
    if not tokens:
        return 0.0
    freqs: Dict[str, int] = {}
    for w in tokens:
        freqs[w] = freqs.get(w, 0) + 1
    return sum(freqs.values()) / (len(set(tokens)) + 1)


def summarize(text: str, max_sentences: int = 3) -> str:
    sents = sentence_split(text)
    if not sents:
        return ""
    scored = sorted([(score_sentence(s), i, s) for i, s in enumerate(sents)], key=lambda x: (-x[0], x[1]))
    # Tomar top N manteniendo el orden original por índice
    top = sorted(scored[:max_sentences], key=lambda x: x[1])
    return " ".join([s for _, _, s in top])


def hmac_signature(payload_bytes: bytes, secret: str) -> str:
    return hmac.new(secret.encode("utf-8"), payload_bytes, hashlib.sha256).hexdigest()


class InvokeInput(BaseModel):
    text: str
    max_sentences: int = 3
    # Campo libre para parámetros; se ignoran claves desconocidas, pero afectan inputHash
    params: Dict[str, Any] | None = None


@app.get("/health")
def health():
    return {"status": "ok", "agentId": AGENT_ID, "version": AGENT_VERSION}


@app.post("/invoke")
async def invoke(
    payload: InvokeInput = Body(...),
    x_api_key: str | None = Header(default=None, alias="x-api-key"),
):
    # Seguridad básica por API key (opcional)
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    # Construir input canónico para hash (texto normalizado + params ordenados)
    canonical = {
        "text": normalize_text(payload.text),
        "max_sentences": int(payload.max_sentences),
        "params": payload.params or {},
    }
    # Ordenar params para determinismo
    if isinstance(canonical["params"], dict):
        canonical["params"] = {k: canonical["params"][k] for k in sorted(canonical["params"].keys())}

    canonical_bytes = str(canonical).encode("utf-8")
    input_hash = sha256_hex(canonical_bytes)

    # Cache
    if input_hash in CACHE:
        cached = CACHE[input_hash]
        return cached

    # Ejecutar
    summary = summarize(canonical["text"], canonical["max_sentences"])

    # Output canónico
    output = {
        "agentId": AGENT_ID,
        "version": AGENT_VERSION,
        "timestamp": int(time.time()),
        "inputHash": input_hash,
        "result": {
            "type": "summary",
            "text": summary,
            "max_sentences": canonical["max_sentences"],
        },
    }

    output_bytes = str(output).encode("utf-8")
    output_hash = sha256_hex(output_bytes)
    signature = hmac_signature(output_bytes, AGENT_SECRET)

    response = {
        **output,
        "outputHash": output_hash,
        "signature": signature,
    }

    CACHE[input_hash] = response
    return response


@app.post("/verify")
async def verify(payload: Dict[str, Any] = Body(...)):
    # Recalcula hash y firma sobre el output recibido
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Payload must be JSON object")

    # Separar firma externa si vino incluida
    provided_signature = payload.get("signature")
    copy = {k: v for k, v in payload.items() if k != "signature"}

    out_bytes = str(copy).encode("utf-8")
    recomputed_hash = sha256_hex(out_bytes)
    recomputed_sig = hmac_signature(out_bytes, AGENT_SECRET)

    return {
        "matchesOutputHash": recomputed_hash == payload.get("outputHash"),
        "matchesSignature": provided_signature == recomputed_sig,
        "recomputedOutputHash": recomputed_hash,
    }
