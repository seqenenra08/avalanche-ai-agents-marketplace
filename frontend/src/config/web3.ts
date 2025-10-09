import { createConfig, http } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Usa tu Project ID de WalletConnect (no uses demo en producción)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [avalancheFuji],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      metadata: {
        name: 'Avalanche AI Agents Marketplace',
        description: 'Marketplace for AI Agents on Avalanche',
        url: 'https://localhost:3000', // 👈 reemplaza con la URL real (HTTPS)
        icons: ['https://localhost:3000/favicon.ico'],
      },
    }),
  ],
  transports: {
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'), // 👈 RPC correcto de Fuji
  },
  ssr: true, // 👈 mejora compatibilidad si usas Next.js 13/14/15
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
