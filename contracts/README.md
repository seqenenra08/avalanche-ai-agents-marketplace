# Smart Contracts - AI Agents Marketplace

Smart contracts en Solidity para el marketplace descentralizado de agentes IA en Avalanche.

## 📜 Contratos

### AgentRegistry.sol
Contrato principal que gestiona el registro, renta y monetización de agentes IA.

**Características:**
- Registro de agentes con metadata IPFS
- Sistema de renta por tiempo (precio por segundo)
- Precio base de activación opcional
- Gestión de disponibilidad de agentes
- Retiro de ganancias para propietarios
- Sistema de puntuación (score)

## 🛠️ Stack Tecnológico

- **Solidity** - Lenguaje de smart contracts
- **Hardhat** - Framework de desarrollo
- **TypeScript** - Para scripts y configuración
- **Avalanche Fuji Testnet** - Red de pruebas

## ⚙️ Configuración

1. Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Configura las variables de entorno en `.env`:
```env
# Private key de tu wallet (sin el prefijo 0x)
PRIVATE_KEY=tu_private_key_aqui

# RPC URL de Avalanche Fuji
AVALANCHE_FUJI_RPC=https://api.avax-test.network/ext/bc/C/rpc

# Opcional: API Key de SnowTrace para verificación
SNOWTRACE_API_KEY=tu_api_key
```

⚠️ **IMPORTANTE:** Nunca compartas tu private key. Usa una wallet de prueba para testnet.

## 🔨 Comandos Principales

### Compilar Contratos
```bash
npx hardhat compile
```

### Desplegar en Avalanche Fuji
```bash
npx hardhat run scripts/deploy.js --network fuji
```

### Verificar Contrato en SnowTrace
```bash
npx hardhat verify --network fuji DEPLOYED_CONTRACT_ADDRESS
```

### Consola de Hardhat (Fuji)
```bash
npx hardhat console --network fuji
```

## 📋 Estructura del Contrato

### Estructuras de Datos

```solidity
struct Agent {
    uint256 id;              // ID único del agente
    address owner;           // Propietario del agente
    string ipfsHash;         // Hash IPFS con metadata
    uint256 score;           // Puntuación (0-100)
    uint256 pricePerSecond;  // Precio en wei por segundo
    uint256 basePrice;       // Precio base de activación
    bool available;          // Disponibilidad para renta
    uint256 createdAt;       // Timestamp de creación
}

struct Rental {
    address renter;          // Quien rentó el agente
    uint256 startAt;        // Inicio de la renta
    uint256 endAt;          // Fin de la renta
    uint256 pricePaid;      // Total pagado
}
```

### Funciones Principales

#### Para Propietarios

```solidity
// Registrar un nuevo agente
function registerAgent(
    string memory _ipfsHash,
    uint256 _pricePerSecond,
    uint256 _basePrice
) external returns (uint256)

// Cambiar disponibilidad
function setAgentAvailability(uint256 _agentId, bool _available) external

// Actualizar precio por segundo
function setAgentPrice(uint256 _agentId, uint256 _newPricePerSecond) external

// Actualizar precio base
function setAgentBasePrice(uint256 _agentId, uint256 _newBasePrice) external

// Retirar ganancias
function withdrawEarnings() external
```

#### Para Usuarios

```solidity
// Rentar un agente
function rentAgent(uint256 _agentId, uint256 _duration) external payable

// Extender renta existente
function extendRental(uint256 _agentId, uint256 _additionalDuration) external payable

// Verificar si un agente está rentado
function isRented(uint256 _agentId) external view returns (bool)
```

#### Funciones de Lectura

```solidity
// Obtener todos los agentes
function getAgents() external view returns (Agent[] memory)

// Obtener un agente específico
function getAgent(uint256 _agentId) external view returns (Agent memory)

// Obtener renta actual
function getCurrentRental(uint256 _agentId) external view returns (Rental memory)

// Ver ganancias del propietario
function getOwnerBalance(address _owner) external view returns (uint256)
```

## Modelo de Precios

El costo total de rentar un agente se calcula como:

```
Total = Precio Base + (Precio por Segundo × Duración en Segundos)
```

**Ejemplo:**
- Precio Base: 0.01 AVAX
- Precio por Segundo: 0.000001 AVAX/s
- Duración: 1 hora (3600 segundos)

```
Total = 0.01 + (0.000001 × 3600)
Total = 0.01 + 0.0036
Total = 0.0136 AVAX
```

## 🚀 Deployment

### Script de Deployment (`scripts/deploy.js`)

```javascript
const hre = require("hardhat");

async function main() {
  const AgentRegistry = await hre.ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy();
  await agentRegistry.deployed();
  
  console.log("AgentRegistry deployed to:", agentRegistry.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### Desplegar en Fuji

```bash
npx hardhat run scripts/deploy.js --network fuji
```

**Salida esperada:**
```
AgentRegistry deployed to: 0x1234567890abcdef...
```

**Importante:** Copia esta dirección y actualízala en:
- `frontend/.env.local` → `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS`
- `frontend/src/hooks/useAgentRegistry.ts` → `AGENT_REGISTRY_ADDRESS`
```

## Eventos del Contrato

```solidity
event AgentRegistered(
    uint256 indexed agentId,
    address indexed owner,
    string ipfsHash,
    uint256 pricePerSecond,
    uint256 basePrice
);

event AgentRented(
    uint256 indexed agentId,
    address indexed renter,
    uint256 duration,
    uint256 totalCost
);

event RentalExtended(
    uint256 indexed agentId,
    address indexed renter,
    uint256 additionalDuration,
    uint256 additionalCost
);

event EarningsWithdrawn(
    address indexed owner,
    uint256 amount
);

event AgentAvailabilityChanged(
    uint256 indexed agentId,
    bool available
);

event AgentPriceUpdated(
    uint256 indexed agentId,
    uint256 newPricePerSecond
);

event AgentBasePriceUpdated(
    uint256 indexed agentId,
    uint256 newBasePrice
);
```

## Verificación en SnowTrace

Después del deployment, verifica tu contrato:

```bash
npx hardhat verify --network fuji 0xTU_DIRECCION_DEL_CONTRATO
```

Ver en SnowTrace Testnet:
https://testnet.snowtrace.io/address/0xTU_DIRECCION_DEL_CONTRATO

## Interacción Manual

### Usando Hardhat Console

```bash
npx hardhat console --network fuji
```

```javascript
// Obtener el contrato desplegado
const AgentRegistry = await ethers.getContractFactory("AgentRegistry")
const contract = await AgentRegistry.attach("0xTU_DIRECCION")

// Registrar un agente
const tx = await contract.registerAgent(
  "QmXxx...",  // IPFS hash
  ethers.parseEther("0.000001"),  // Precio por segundo
  ethers.parseEther("0.01")       // Precio base
)
await tx.wait()

// Obtener todos los agentes
const agents = await contract.getAgents()
console.log(agents)

// Ver balance de propietario
const balance = await contract.getOwnerBalance("0xTU_DIRECCION")
console.log(ethers.formatEther(balance), "AVAX")
```

## Seguridad

- Validación de ownership en todas las funciones de propietario
- Verificación de disponibilidad antes de rentar
- Validación de duración mínima (> 0)
- Cálculo seguro de precios con SafeMath implícito (Solidity 0.8+)
- Prevención de reentrancy con checks-effects-interactions pattern
- Balance tracking separado por propietario

## Recursos

- [Hardhat Docs](https://hardhat.org/docs)
- [Solidity Docs](https://docs.soliditylang.org)
- [Avalanche Docs](https://docs.avax.network)
- [SnowTrace](https://testnet.snowtrace.io)

## Notas Importantes

1. Este es un contrato de **testnet** (Avalanche Fuji)
2. Usa fondos de prueba obtenidos del [faucet](https://faucet.avax.network)
3. No uses private keys de cuentas con fondos reales
4. El contrato NO ha sido auditado - solo para propósitos educativos/demo

---

**Parte del AI Agents Marketplace en Avalanche**
