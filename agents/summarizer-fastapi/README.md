# Summarizer Agent (FastAPI)

Agente minimalista para el **Avalanche AI Agents Marketplace**. Determinista, con `inputHash`/`outputHash` y `signature` (HMAC-SHA256) para verificación on-chain.

## Ejecutar local

```bash
cd agents/summarizer-fastapi
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export $(cat .env | xargs)  # o carga manual de variables
uvicorn main:app --reload --port 8000
```

**Probar**

```bash
curl -X POST http://localhost:8000/invoke \
  -H 'Content-Type: application/json' \
  -H 'x-api-key: OPCIONAL-API-KEY' \
  -d '{"text": "El marketplace permite registrar agentes IA...", "max_sentences": 2}'
```

**Verificar**

```bash
curl -X POST http://localhost:8000/verify \
  -H 'Content-Type: application/json' \
  -d '{"agentId":"summarizer-001", "version":"1.0.0", "timestamp":123, "inputHash":"...", "result":{"type":"summary","text":"...","max_sentences":2}, "outputHash":"...", "signature":"..."}'
```

## Deploy en Render (gratis)

1. Crea un nuevo **Web Service** apuntando a esta carpeta.
2. **Build Command:** `pip install -r requirements.txt`
3. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Define variables de entorno: `AGENT_ID`, `AGENT_VERSION`, `AGENT_SECRET`, `API_KEY` (opcional).
5. Copia la URL pública resultante en `metadata.json` y súbela a IPFS.

## Integración con el Marketplace

* **Registro:** Sube `metadata.json` a IPFS y usa el CID en `AgentRegistry.registerAgent(ipfsHash)`.
* **Ejecución:** Desde el frontend/gateway, invoca `POST /invoke` con `{ text, max_sentences, params? }`.
* **Verificación on-chain:** Toma `outputHash` del response y llama `AgentExecution.recordExecution(agentId, user, inputHash, outputHash)`.
* **Reutilización:** Si el mismo `inputHash` se invoca de nuevo, el agente devuelve el resultado desde caché.

## Seguridad

* Header `x-api-key` (si `API_KEY` está definido).
* Respuesta firmada: `signature = HMAC_SHA256(secret, output-sin-signature)`.
* Endpoint `/verify` para recomputar hash y firma.

## Esquema de respuesta `/invoke`

```json
{
  "agentId": "summarizer-001",
  "version": "1.0.0",
  "timestamp": 173###,
  "inputHash": "<sha256>",
  "result": { "type": "summary", "text": "...", "max_sentences": 3 },
  "outputHash": "<sha256>",
  "signature": "<hmac>"
}
```

## Notas

* El resumen es **extractivo**: selecciona oraciones con mayor score; es 100% determinista.
* Puedes reemplazar `summarize()` por un modelo externo (OpenAI/HF) y mantener la misma envoltura de hashes/firma.
