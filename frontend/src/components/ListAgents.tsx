'use client'

import { useEffect, useState } from 'react'
import { useAllAgents, type Agent } from '@/hooks/useAgentRegistry'
import { formatEther } from 'viem'

export function AgentsList() {
  const [agents, setAgents] = useState<Agent[]>([])
  const { data, isLoading, error } = useAllAgents()

  useEffect(() => {
    if (data && Array.isArray(data)) {
      const parsedAgents: Agent[] = data.map((agent: any) => {
        if (Array.isArray(agent)) {
            const [id, owner, ipfsHash, score, pricePerSecond, basePrice, available, createdAt] = agent
            return { id, owner, ipfsHash, score, pricePerSecond, basePrice, available, createdAt }
        }
        return agent
        })
      setAgents(parsedAgents)
    }
  }, [data])

  if (isLoading) return <p>Cargando agentes...</p>
  if (error) return <p>Error: {error instanceof Error ? error.message : String(error)}</p>

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Agentes registrados</h2>
      {agents.length > 0 ? (
        <ul>
          {agents.map((agent) => (
            <li key={agent.id.toString()} className="border p-2 mb-1 rounded">
              <p><strong>ID:</strong> {agent.id.toString()}</p>
              <p><strong>Owner:</strong> {agent.owner}</p>
              <p><strong>IPFS:</strong> {agent.ipfsHash}</p>
              <p><strong>Price/s:</strong> {formatEther(agent.pricePerSecond)}</p>
              <p><strong>Base Price/s:</strong> {formatEther(agent.basePrice)}</p>
              <p><strong>Available:</strong> {agent.available ? 'Sí' : 'No'}</p>
              <p><strong>Created At:</strong> {new Date(Number(agent.createdAt) * 1000).toLocaleString()}</p>
              <p><strong>Score:</strong> {agent.score.toString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay agentes registrados aún.</p>
      )}
    </div>
  )
}