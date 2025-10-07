import { createConfig, http } from 'wagmi'
import { avalancheFuji } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// Project ID from WalletConnect Cloud
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
        url: 'https://localhost:3000',
        icons: ['https://localhost:3000/favicon.ico']
      }
    }),
  ],
  transports: {
    [avalancheFuji.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}