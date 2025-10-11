# Frontend - AI Agents Marketplace

Aplicación web Next.js para el marketplace descentralizado de agentes IA en Avalanche.

## Características

- **Marketplace de Agentes**: Explora y renta agentes IA disponibles
- **Registro de Agentes**: Publica tus propios agentes IA en blockchain
- **Gestión de Agentes**: Panel para administrar tus agentes (Mis Agentes)
- **Integración Web3**: Conexión con Metamask y Avalanche Fuji
- **Sistema de Rentas**: Renta agentes por tiempo con pagos en AVAX
- **Validación de Balance**: Verifica fondos antes de transacciones

## Stack Tecnológico

- **Next.js 15.5.4** - Framework React con App Router
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos y diseño
- **Wagmi 2.17.5** - Hooks para interacción Web3
- **Viem 2.38.0** - Utilidades Ethereum
- **React Query** - Gestión de estado y caché
- **Lucide React** - Iconos

## Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env.local
```

2. Configura las variables de entorno en `.env.local`:
```env
# Dirección del smart contract desplegado en Avalanche Fuji
NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS=0x...

# URL del gateway backend
NEXT_PUBLIC_GATEWAY_URL=http://localhost:4000

# API Key para comunicación con el gateway
NEXT_PUBLIC_MY_API_KEY=tu_clave_secreta

# RPC de Avalanche Fuji
NEXT_PUBLIC_AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc

# Gateway IPFS para leer metadata
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

3. Asegúrate de tener:
   - Metamask instalado en tu navegador
   - AVAX en Avalanche Fuji testnet
   - Gateway backend corriendo en el puerto 4000

## Ejecución

**Modo Desarrollo:**
```bash
npm run dev
```

**Modo Producción:**
```bash
npm run build
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── page.tsx           # Marketplace (página principal)
│   │   ├── register/          # Formulario de registro de agentes
│   │   │   └── page.tsx
│   │   ├── myAgents/          # Gestión de agentes propios
│   │   │   └── page.tsx
│   │   ├── agent/[id]/        # Detalle de agente individual
│   │   │   └── page.tsx
│   │   ├── api/               # API Routes
│   │   │   └── ipfs/upload/   # Upload a IPFS
│   │   ├── layout.tsx         # Layout raíz
│   │   └── globals.css        # Estilos globales
│   │
│   ├── components/            # Componentes React
│   │   ├── Header.tsx         # Navegación y conexión wallet
│   │   ├── Footer.tsx         # Footer del sitio
│   │   └── Layout.tsx         # Layout wrapper
│   │
│   ├── hooks/                 # Custom hooks
│   │   └── useAgentRegistry.ts # Hooks para smart contract
│   │
│   ├── services/              # Servicios externos
│   │   ├── ipfs.ts           # Servicio IPFS
│   │   └── gateway.ts        # Servicio gateway
│   │
│   ├── config/               # Configuración
│   │   └── web3modal.ts      # Config de Wagmi
│   │
│   ├── contracts/            # ABIs de contratos
│   │   └── AgentRegistry.ts
│   │
│   └── providers/            # Providers de React
│       └── Web3Provider.tsx
│
├── public/                   # Archivos estáticos
├── next.config.ts           # Configuración de Next.js
├── tailwind.config.ts       # Configuración de Tailwind
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias
```

## Páginas Principales

### 1. **Marketplace** (`/`)
- Lista todos los agentes registrados
- Búsqueda y filtros por categoría
- Ver detalles de cada agente
- Rentar agentes directamente desde el modal

### 2. **Registrar Agente** (`/register`)
- Formulario completo de registro
- Validación de balance AVAX
- Upload automático a IPFS vía gateway
- Registro en blockchain
- Campos: nombre, descripción, endpoint, categoría, precio base, precio por hora

### 3. **Mis Agentes** (`/myAgents`)
- Lista de agentes propios
- Activar/Desactivar disponibilidad
- Editar precios (base y por segundo)
- Ver estadísticas y ganancias
- Retirar ganancias acumuladas
- Modal de detalles completos

### 4. **Detalle de Agente** (`/agent/[id]`)
- Información completa del agente
- Estado de renta actual
- Formulario de renta
- Cálculo de costos en tiempo real

## Integración Web3

### Conexión de Wallet
```typescript
// El componente Header maneja la conexión
import { useAccount, useConnect, useDisconnect } from 'wagmi'

// Conectar con Metamask (injected connector)
const { connect } = useConnect()
connect({ connector: injectedConnector })
```

### Interacción con Smart Contract
```typescript
// Usando hooks personalizados
import { useRegisterAgent, useRentAgent } from '@/hooks/useAgentRegistry'

// Registrar agente
const { registerAgent } = useRegisterAgent()
await registerAgent(ipfsHash, pricePerSecond, basePrice)

// Rentar agente
const { rentAgent } = useRentAgent()
await rentAgent(agentId, duration, pricePerSecond, basePrice)
```

## Personalización de Estilos

El proyecto usa Tailwind CSS v4 con tema personalizado:

```css
@theme inline {
  --color-primary-50: #eff6ff;
  --color-primary-600: #2563eb;
  /* ... más colores */
}
```

## Testing

```bash
# Verificar compilación
npm run build

# Linter
npm run lint
```

## Solución de Problemas

### Error de webpack con electron
**Solución:** Ya configurado en `next.config.ts` con fallbacks para módulos node.

### Error de conexión con gateway
**Solución:** Verifica que el gateway esté corriendo en el puerto 4000 y que la API key coincida.

### Error de transacción en blockchain
**Solución:** 
- Verifica que tengas AVAX en Fuji: https://faucet.avax.network
- Confirma que la dirección del contrato sea correcta
- Asegúrate de estar en la red Avalanche Fuji

### Balance insuficiente
**Solución:** El formulario de registro valida automáticamente que tengas al menos 0.01 AVAX para gas.

## Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [Wagmi Docs](https://wagmi.sh)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Avalanche Docs](https://docs.avax.network)

## Flujo de Usuario

1. Usuario conecta wallet con Metamask
2. Navega el marketplace de agentes
3. Puede registrar nuevos agentes (requiere AVAX)
4. Renta agentes por tiempo específico
5. Gestiona sus propios agentes desde "Mis Agentes"
6. Retira ganancias acumuladas

---

**Parte del AI Agents Marketplace en Avalanche**
