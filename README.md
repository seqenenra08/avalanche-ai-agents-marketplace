# Avalanche AI Agents Marketplace

🚀 **Marketplace descentralizado de agentes IA en Avalanche**
donde cada agente es propiedad de su creador, sus acciones son
verificables en blockchain y sus resultados pueden auditarse públicamente.

---

## 🧩 Estructura
- `contracts/` → Smart contracts (AgentRegistry, Billing, Reputation)
- `gateway/` → API para conectar blockchain ↔ agentes IA
- `frontend/` → Interfaz Next.js con WalletConnect
- `agents/` → Agentes IA (Summarizer, Sentiment Analyzer)
- `docs/` → Documentación técnica y presentación

---

## 🛠️ Stack
- **Blockchain:** Avalanche Fuji Testnet + Hardhat
- **Frontend:** Next.js + Tailwind + Ethers.js
- **Backend:** FastAPI / Express
- **AI:** Python + OpenAI / HuggingFace APIs
- **Storage:** IPFS (metadata y outputs)

---

## 📜 Contratos Clave
- `AgentRegistry.sol` → Registro + tokenización (NFT/ERC-6551)
- `Billing.sol` → Creación y liquidación de tickets
- `Reputation.sol` → Calificaciones on-chain

---

## ⚙️ Setup rápido
```bash
git clone https://github.com/<usuario>/avalanche-ai-agents-marketplace
cd avalanche-ai-agents-marketplace
npm install
npx hardhat compile
