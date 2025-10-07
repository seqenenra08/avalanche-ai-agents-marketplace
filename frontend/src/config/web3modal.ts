import { createConfig, http } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const wagmiConfig = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(), // Solo MetaMask/Injected para evitar problemas
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
})