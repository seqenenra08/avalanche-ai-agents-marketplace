# Avalanche AI Agents Marketplace

🚀 **Marketplace descentralizado de agentes IA en Avalanche**
donde cada agente es propiedad de su creador, sus acciones son
verificables en blockchain y sus resultados pueden auditarse públicamente.

---

## 🧩 Estructura del Proyecto

```
avalanche-ai-agents-marketplace/
├── contracts/                 # Smart contracts Solidity
│   ├── contracts/
│   │   └── AgentRegistry.sol  # Contrato principal con modelo de renta por tiempo
│   ├── scripts/
│   │   └── deploy.js         # Script de deployment
│   └── hardhat.config.ts     # Configuración de Hardhat
│
├── gateway/                   # Backend gateway
│   ├── index.js              # Servidor Express con endpoints IPFS y ejecución
│   ├── package.json          # Dependencias del gateway
│   ├── .env.example          # Template de configuración
│   └── README.md             # Documentación completa del gateway
│
├── frontend/                  # Aplicación Next.js
│   ├── src/
│   │   ├── app/              # App Router
│   │   │   ├── page.tsx      # Marketplace de agentes
│   │   │   ├── register/     # Formulario de registro
│   │   │   ├── agent/[id]/   # Detalle y renta de agentes
│   │   │   └── api/          # API routes (IPFS upload)
│   │   ├── components/       # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Layout.tsx
│   │   ├── config/
│   │   │   └── web3modal.ts  # Configuración Wagmi
│   │   ├── contracts/
│   │   │   └── AgentRegistry.ts  # ABI del contrato
│   │   ├── hooks/
│   │   │   └── useAgentRegistry.ts  # Custom hooks para Web3
│   │   ├── providers/
│   │   │   └── Web3Provider.tsx
│   │   └── services/
│   │       ├── ipfs.ts       # Servicio IPFS
│   │       └── gateway.ts    # Servicio del gateway
│   └── package.json
│
├── agents/                    # Agentes IA (por implementar)
└── docs/                      # Documentación adicional
```

---

## 🛠️ Stack Tecnológico

### Blockchain
- **Avalanche Fuji Testnet** (Chain ID: 43113)
- **Hardhat** - Framework de desarrollo
- **Solidity** - Smart contracts
- **AgentRegistryRentable** - Contrato con modelo de renta por tiempo

### Frontend
- **Next.js 15.5.4** con TypeScript y App Router
- **Tailwind CSS v4** - Estilos
- **Wagmi 2.17.5** - Hooks para Web3
- **Viem 2.38.0** - Utilidades Ethereum
- **React Query** - Cache y sincronización
- **Lucide React** - Iconos

### Backend Gateway
- **Express.js 5.1.0** - Servidor HTTP
- **Axios** - Cliente HTTP
- **Pinata** - IPFS hosting
- **express-rate-limit** - Rate limiting (100 req/15min)
- **crypto** - Hash SHA-256 para caché

### Seguridad
- Autenticación por API key
- Rate limiting por IP
- Hash de inputs/outputs
- Sistema de caché inteligente

---

## 📜 Smart Contract: AgentRegistryRentable

### Características Principales

**Modelo de Renta por Tiempo:**
- Los usuarios rentan agentes pagando por segundo
- Precio definido por el propietario (wei/segundo)
- Extensión de rentas sin límite
- Retiro de ganancias por propietarios

**Funciones Principales:**
```solidity
registerAgent(ipfsHash, pricePerSecond, endpoint)
rentAgent(agentId, duration) payable
extendRental(agentId, additionalDuration) payable
getAgents()
getAgent(agentId)
withdrawEarnings()
```

**Eventos:**
- `AgentRegistered`
- `AgentRented`
- `RentalExtended`
- `EarningsWithdrawn`

---

## ⚙️ Setup e Instalación

### 1. Requisitos Previos
- Node.js 18.20+ 
- npm o yarn
- Metamask instalado
- Cuenta en [Pinata.cloud](https://pinata.cloud) para IPFS

### 2. Clonar el Repositorio
```bash
git clone https://github.com/<usuario>/avalanche-ai-agents-marketplace
cd avalanche-ai-agents-marketplace
```

### 3. Instalar Dependencias

**Contratos:**
```bash
cd contracts
npm install
```

**Gateway:**
```bash
cd gateway
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### 4. Configuración

#### Contratos (contracts/)
Configura `hardhat.config.ts` con tu private key y RPC URL de Avalanche Fuji.

#### Gateway (gateway/)
```bash
cd gateway
cp .env.example .env
```

Edita `.env`:
```env
MY_API_KEY=tu_clave_secreta_gateway
PINATA_API_KEY=tu_api_key_pinata
PINATA_SECRET_KEY=tu_secret_key_pinata
PORT=4000
```

#### Frontend (frontend/)
```bash
cd frontend
cp .env.example .env.local
```

Edita `.env.local`:
```env
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...  # Dirección del contrato desplegado
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000
NEXT_PUBLIC_MY_API_KEY=tu_clave_secreta_gateway
```

### 5. Deployment del Contrato

```bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network fuji
```

Copia la dirección del contrato desplegado a `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS` en el frontend.

### 6. Ejecutar el Proyecto

**Terminal 1 - Gateway:**
```bash
cd gateway
npm run dev
# Servidor en http://localhost:4000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Aplicación en http://localhost:3000
```

---

## 🚀 Uso del Marketplace

### Para Propietarios de Agentes IA

1. **Conectar Wallet**
   - Click en "Connect Wallet" en el header
   - Selecciona Metamask
   - Asegúrate de estar en Avalanche Fuji

2. **Registrar un Agente**
   - Ve a `/register`
   - Completa el formulario:
     - Nombre del agente
     - Descripción
     - Endpoint API (URL donde responde tu agente)
     - Categoría
     - Precio por segundo (en AVAX)
   - Click en "Register Agent"
   - Confirma las transacciones:
     1. Upload a IPFS (gratuito)
     2. Registro en blockchain (gas fee)

3. **Gestionar Ganancias**
   - Desde la página del agente
   - Click en "Withdraw Earnings"
   - Retira tus ganancias acumuladas

### Para Usuarios/Renters

1. **Explorar Agentes**
   - Marketplace en la página principal
   - Filtra por categoría, precio, etc.
   - Ve detalles de cada agente

2. **Rentar un Agente**
   - Click en el agente deseado
   - Especifica la duración (en segundos)
   - Click en "Rent Agent"
   - Confirma la transacción (precio = duration × pricePerSecond)

3. **Ejecutar Agente**
   - Usa el gateway o tu propia implementación
   - POST a `/execute` con el endpoint del agente
   - Recibe respuestas cacheadas si el input es igual

---

## 📡 API del Gateway

Ver documentación completa en [`gateway/README.md`](gateway/README.md)

**Endpoints principales:**
- `POST /upload` - Sube metadata a IPFS
- `POST /execute` - Ejecuta agente con caché
- `GET /cache/stats` - Estadísticas del caché
- `DELETE /cache` - Limpia caché
- `GET /health` - Health check

---

## 🧪 Testing

### Gateway
```bash
# Health check
curl http://localhost:4000/health

# Upload a IPFS
curl -X POST http://localhost:4000/upload \
  -H "x-api-key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Agent", "description": "Test"}'
```

### Frontend
```bash
cd frontend
npm run build  # Verifica que compile sin errores
```

---

## 🔒 Seguridad

- **Rate Limiting:** 100 requests por 15 minutos por IP
- **API Key Authentication:** Todos los endpoints del gateway (excepto /health)
- **Input/Output Hashing:** SHA-256 para integridad
- **Caché Inteligente:** Evita ejecuciones duplicadas

---

## 🐛 Troubleshooting

**"Module not found: electron"**
- Ya resuelto en `next.config.ts` con webpack fallbacks

**"Cannot connect wallet"**
- Verifica que Metamask esté instalado
- Asegúrate de estar en Avalanche Fuji
- Añade la red manualmente si es necesario

**"Transaction failed"**
- Verifica que tengas AVAX en Fuji
- Usa el faucet: https://faucet.avax.network
- Aumenta el gas limit si es necesario

**Gateway 401 Unauthorized**
- Verifica que `x-api-key` header esté presente
- Confirma que coincida con `MY_API_KEY` en gateway/.env

---

## 📚 Recursos

- [Avalanche Docs](https://docs.avax.network)
- [Wagmi Docs](https://wagmi.sh)
- [Next.js Docs](https://nextjs.org/docs)
- [Hardhat Docs](https://hardhat.org)
- [Pinata Docs](https://docs.pinata.cloud)

---

## 🛣️ Roadmap

- [x] Smart contract con modelo de renta por tiempo
- [x] Frontend con Next.js y Wagmi
- [x] Gateway con IPFS y caché
- [x] Sistema de seguridad y rate limiting
- [ ] Implementar agentes IA de ejemplo
- [ ] Sistema de reputación on-chain
- [ ] Billing avanzado con tickets
- [ ] Panel de analytics para propietarios
- [ ] Integración con más redes de Avalanche
- [ ] Marketplace de prompts y configuraciones

---

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles

---

## 👥 Contribuir

Las contribuciones son bienvenidas! Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

**Desarrollado con ❤️ para la comunidad de Avalanche 🔺**
