# Gateway Backend - AI Agents Marketplace

Gateway backend para el marketplace de agentes IA en Avalanche. Proporciona funcionalidades de IPFS, ejecución de agentes, caché y seguridad.

## 🚀 Características

- **Upload a IPFS**: Sube metadata de agentes a IPFS usando Pinata
- **Ejecución de Agentes**: Ejecuta agentes AI de forma segura
- **Sistema de Caché**: Cache inteligente basado en hash de inputs
- **Seguridad**: 
  - Autenticación por API key
  - Rate limiting (100 req/15min)
  - Hash de inputs y outputs
- **Monitoreo**: Health checks y estadísticas de caché

## 📦 Instalación

```bash
cd gateway
npm install
```

## ⚙️ Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Configura tus variables de entorno en `.env`:
```env
MY_API_KEY=tu_clave_secreta_aqui
PINATA_API_KEY=tu_api_key_de_pinata
PINATA_SECRET_KEY=tu_secret_key_de_pinata
PORT=4000
```

3. Obtén credenciales de Pinata:
   - Crea una cuenta en [Pinata.cloud](https://pinata.cloud)
   - Ve a API Keys y genera nuevas credenciales
   - Copia el API Key y Secret API Key

## 🏃 Ejecución

**Desarrollo:**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor se ejecutará en `http://localhost:4000`

## 📡 API Endpoints

### POST /upload
Sube metadata del agente a IPFS.

**Headers:**
- `x-api-key`: Tu API key
- `Content-Type`: application/json

**Body:**
```json
{
  "name": "Mi Agente IA",
  "description": "Descripción del agente",
  "endpoint": "https://mi-agente.com/api",
  "category": "Conversational",
  "documentation": "URL de documentación",
  "version": "1.0.0",
  "tags": ["NLP", "AI"],
  "owner": "0x..."
}
```

**Response:**
```json
{
  "message": "Metadata uploaded successfully",
  "ipfsHash": "QmXxx...",
  "ipfsLink": "ipfs://QmXxx..."
}
```

### POST /execute
Ejecuta un agente IA.

**Headers:**
- `x-api-key`: Tu API key
- `Content-Type`: application/json

**Body:**
```json
{
  "agentEndpoint": "https://mi-agente.com/api",
  "userInput": {
    "query": "¿Cómo estás?"
  },
  "agentId": 1
}
```

**Response:**
```json
{
  "output": {
    "response": "¡Estoy bien, gracias!"
  },
  "outputHash": "abc123...",
  "inputHash": "def456...",
  "cached": false,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### GET /cache/stats
Obtiene estadísticas del caché.

**Headers:**
- `x-api-key`: Tu API key

**Response:**
```json
{
  "cacheSize": 42,
  "entries": [
    {
      "inputHash": "abc123...",
      "timestamp": "2025-01-15T10:30:00.000Z",
      "outputHashPreview": "def456..."
    }
  ]
}
```

### DELETE /cache
Limpia el caché completamente.

**Headers:**
- `x-api-key`: Tu API key

**Response:**
```json
{
  "message": "Cache cleared",
  "entriesCleared": 42
}
```

### GET /health
Health check del servidor (no requiere autenticación).

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600,
  "cacheSize": 42,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## 🔒 Seguridad

### Rate Limiting
- Límite: 100 requests por 15 minutos por IP
- Respuesta: 429 Too Many Requests

### Autenticación
Todos los endpoints (excepto `/health`) requieren el header `x-api-key`.

**Ejemplo:**
```bash
curl -X POST http://localhost:4000/execute \
  -H "x-api-key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{"agentEndpoint": "...", "userInput": {...}}'
```

## 💾 Sistema de Caché

El gateway cachea automáticamente las respuestas de los agentes basándose en el hash SHA-256 del input.

**Beneficios:**
- Reduce llamadas redundantes a agentes
- Mejora la latencia de respuesta
- Ahorra costos de ejecución

**Funcionamiento:**
1. Se calcula el `inputHash` del userInput
2. Si existe en caché, se devuelve inmediatamente
3. Si no existe, se ejecuta el agente y se cachea el resultado

## 🧪 Testing

**Upload a IPFS:**
```bash
curl -X POST http://localhost:4000/upload \
  -H "x-api-key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "Agent de prueba",
    "endpoint": "https://example.com/api",
    "category": "Test"
  }'
```

**Execute Agent:**
```bash
curl -X POST http://localhost:4000/execute \
  -H "x-api-key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "agentEndpoint": "https://example.com/api",
    "userInput": {"query": "Hello"}
  }'
```

**Health Check:**
```bash
curl http://localhost:4000/health
```

## 📊 Logs

El gateway proporciona logs detallados:
- 🤖 Ejecución de agentes
- 🔑 Cálculo de hashes
- ✨ Cache hits/misses
- 💾 Estado del caché
- ❌ Errores y timeouts

## 🛠️ Desarrollo

**Estructura del proyecto:**
```
gateway/
├── index.js           # Servidor principal
├── package.json       # Dependencias
├── .env              # Configuración (no commitear)
├── .env.example      # Ejemplo de configuración
├── .gitignore        # Git ignore
└── README.md         # Esta documentación
```

## 🐛 Troubleshooting

**Error 401 Unauthorized:**
- Verifica que el header `x-api-key` esté presente
- Confirma que la API key coincida con `MY_API_KEY` en `.env`

**Error 429 Too Many Requests:**
- Estás excediendo el rate limit (100 req/15min)
- Espera unos minutos o implementa retry logic

**Error 504 Gateway Timeout:**
- El agente tardó más de 30 segundos en responder
- Verifica que el endpoint del agente esté disponible

**Error de conexión al agente:**
- Verifica que el `agentEndpoint` sea correcto
- Confirma que el agente esté online y accesible

## 📝 Notas

- El caché se mantiene en memoria (Map) y se pierde al reiniciar el servidor
- Para producción, considera usar Redis o similar para caché persistente
- Los timeouts de agentes están configurados a 30 segundos
- Rate limiting es por IP, no por API key

## 🔗 Links Útiles

- [Pinata Cloud](https://pinata.cloud)
- [Avalanche Docs](https://docs.avax.network)
- [Express.js Docs](https://expressjs.com)

---

Desarrollado para el AI Agents Marketplace en Avalanche 🔺