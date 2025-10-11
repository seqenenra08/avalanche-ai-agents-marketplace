# AI Agents - Agentes de Inteligencia Artificial

Directorio para implementar y registrar agentes de IA que serán publicados en el marketplace.

## ¿Qué son los Agentes IA?

Los agentes IA son servicios inteligentes que pueden:
- Procesar consultas de lenguaje natural
- Realizar análisis de datos
- Generar contenido creativo
- Automatizar tareas específicas
- Proporcionar asistencia virtual

## Estructura Recomendada

```
agents/
├── agent-name/
│   ├── src/
│   │   └── index.js          # Punto de entrada del agente
│   ├── tests/
│   │   └── agent.test.js     # Tests unitarios
│   ├── Dockerfile            # Containerización (opcional)
│   ├── package.json          # Dependencias
│   ├── .env.example          # Variables de entorno
│   └── README.md             # Documentación del agente
│
└── another-agent/
    └── ...
```

## 🚀 Crear un Nuevo Agente

### 1. Estructura Básica

Crea un nuevo directorio para tu agente:

```bash
mkdir agents/mi-agente
cd agents/mi-agente
npm init -y
```

### 2. Implementación Mínima

Tu agente debe ser un servidor HTTP que responda a requests POST:

**Ejemplo en Node.js/Express:**

```javascript
// src/index.js
const express = require('express');
const app = express();
app.use(express.json());

// Endpoint principal que procesa requests
app.post('/api', async (req, res) => {
  try {
    const { query, context } = req.body;
    
    // Tu lógica de IA aquí
    const result = await processQuery(query);
    
    res.json({
      success: true,
      response: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

async function processQuery(query) {
  // Implementa tu lógica de IA
  // Ejemplo: integración con OpenAI, HuggingFace, etc.
  return `Respuesta procesada para: ${query}`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agent running on port ${PORT}`);
});
```

**Ejemplo en Python/FastAPI:**

```python
# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class Query(BaseModel):
    query: str
    context: dict = {}

@app.post("/api")
async def process_query(query: Query):
    try:
        # Tu lógica de IA aquí
        result = await process_ai_query(query.query)
        
        return {
            "success": True,
            "response": result,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_ai_query(query: str):
    # Implementa tu lógica de IA
    return f"Respuesta procesada para: {query}"

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=3000)
```

### 3. Definir Metadata

Crea un archivo `metadata.json` con información del agente:

```json
{
  "name": "Mi Agente IA",
  "description": "Descripción detallada de las capacidades del agente",
  "version": "1.0.0",
  "category": "Conversational",
  "tags": ["NLP", "Chat", "AI"],
  "endpoint": "https://tu-agente.com/api",
  "documentation": "https://docs.tu-agente.com",
  "pricing": {
    "basePrice": "0.01",
    "pricePerHour": "0.01"
  },
  "capabilities": [
    "Responder preguntas en lenguaje natural",
    "Análisis de sentimientos",
    "Generación de texto"
  ],
  "requirements": [
    "API Key de OpenAI (opcional)",
    "Conexión a internet"
  ]
}
```

## Deployment del Agente

### Opción 1: Servidor Propio

```bash
# Producción
npm start

# Con PM2 (recomendado)
npm install -g pm2
pm2 start src/index.js --name mi-agente
pm2 save
```

### Opción 2: Servicios Cloud

**Heroku:**
```bash
heroku create mi-agente-ia
git push heroku main
```

**Railway:**
```bash
railway login
railway init
railway up
```

**Render/Fly.io/DigitalOcean:** Sigue la documentación específica de cada plataforma.

### Opción 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .

EXPOSE 3000
CMD ["node", "src/index.js"]
```

```bash
# Build y run
docker build -t mi-agente .
docker run -p 3000:3000 mi-agente
```

## Registrar en el Marketplace

Una vez que tu agente esté desplegado y accesible:

1. **Obtén la URL pública** de tu agente (ej: `https://mi-agente.herokuapp.com/api`)

2. **Ve al frontend** del marketplace: `http://localhost:3000/register`

3. **Completa el formulario:**
   - Nombre del agente
   - Descripción
   - Endpoint (URL)
   - Categoría
   - Precio base (AVAX)
   - Precio por hora (AVAX)
   - Tags y documentación

4. **Confirma la transacción** en Metamask

5. **¡Listo!** Tu agente estará disponible en el marketplace

## Testing del Agente

### Test Local

```bash
# Inicia tu agente
npm start

# En otra terminal, prueba el endpoint
curl -X POST http://localhost:3000/api \
  -H "Content-Type: application/json" \
  -d '{"query": "Hola, ¿cómo estás?"}'
```

### Test con el Gateway

```bash
# Usando el gateway del marketplace
curl -X POST http://localhost:4000/execute \
  -H "x-api-key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "agentEndpoint": "http://localhost:3000/api",
    "userInput": {"query": "Test"}
  }'
```

## Ejemplos de Agentes

### Agente Simple de Chat

```javascript
// Agente que responde con respuestas predefinidas
const responses = {
  'hola': '¡Hola! ¿En qué puedo ayudarte?',
  'adios': '¡Hasta luego! Que tengas un buen día',
  'default': 'Interesante pregunta, déjame procesarla...'
};

app.post('/api', (req, res) => {
  const query = req.body.query.toLowerCase();
  const response = responses[query] || responses.default;
  res.json({ response });
});
```

### Agente con OpenAI

```javascript
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api', async (req, res) => {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: req.body.query }]
  });
  
  res.json({
    response: completion.choices[0].message.content
  });
});
```

### Agente de Análisis de Sentimientos

```python
from transformers import pipeline

sentiment_analyzer = pipeline("sentiment-analysis")

@app.post("/api")
async def analyze_sentiment(query: Query):
    result = sentiment_analyzer(query.query)[0]
    return {
        "response": f"Sentimiento: {result['label']} ({result['score']:.2%})"
    }
```

## Seguridad

### Mejores Prácticas

1. **Validación de Input:**
```javascript
const validateInput = (query) => {
  if (!query || typeof query !== 'string') {
    throw new Error('Query inválido');
  }
  if (query.length > 1000) {
    throw new Error('Query demasiado largo');
  }
  return query.trim();
};
```

2. **Rate Limiting:**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api', limiter);
```

3. **Autenticación (opcional):**
```javascript
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.AGENT_API_KEY) {
    return res.status(401).json({ error: 'No autorizado' });
  }
  next();
};

app.post('/api', authenticate, async (req, res) => {
  // Tu lógica aquí
});
```

## Monetización

Tu agente genera ingresos automáticamente cuando:
- Usuarios lo rentan en el marketplace
- El pago se calcula: `Precio Base + (Precio por Segundo × Duración)`
- Las ganancias se acumulan en tu wallet
- Puedes retirarlas desde "Mis Agentes"

## Monitoreo

Implementa logging para monitorear tu agente:

```javascript
app.post('/api', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const result = await processQuery(req.body.query);
    
    console.log({
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      status: 'success',
      query: req.body.query
    });
    
    res.json({ response: result });
  } catch (error) {
    console.error({
      timestamp: new Date().toISOString(),
      duration: Date.now() - startTime,
      status: 'error',
      error: error.message
    });
    
    res.status(500).json({ error: error.message });
  }
});
```

## Troubleshooting

**Agente no responde:**
- Verifica que esté corriendo: `curl http://localhost:3000/health`
- Revisa los logs del servidor
- Confirma que el puerto esté abierto

**Gateway no puede conectar:**
- URL debe ser pública y accesible desde internet
- No uses `localhost` en producción
- Verifica CORS si es necesario

**Errores de timeout:**
- Optimiza el tiempo de respuesta de tu agente
- El gateway tiene timeout de 30 segundos

## Recursos

- [Express.js Docs](https://expressjs.com)
- [FastAPI Docs](https://fastapi.tiangolo.com)
- [OpenAI API](https://platform.openai.com/docs)
- [HuggingFace Transformers](https://huggingface.co/docs/transformers)

## Próximos Pasos

1. Crea tu primer agente localmente
2. Pruébalo exhaustivamente
3. Despliégalo en un servicio cloud
4. Regístralo en el marketplace
5. ¡Empieza a ganar AVAX! 

---

**Parte del AI Agents Marketplace en Avalanche**
