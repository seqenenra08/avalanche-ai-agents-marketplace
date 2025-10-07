'use client'

import { Layout } from '@/components/Layout'
import { Star, Users, Download, Share, Bot, CheckCircle, Calendar, User, AlertCircle } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAgent, useIsAgentRented, useRentAgent, formatPricePerSecond } from '@/hooks/useAgentRegistry'
import { ipfsService } from '@/services/ipfs'

// Mock data - esto vendrá del contrato y IPFS más adelante
const mockAgent = {
  id: 1,
  name: "ChatBot Assistant",
  description: "Asistente conversacional avanzado con capacidades de procesamiento de lenguaje natural. Este agente puede mantener conversaciones coherentes, responder preguntas complejas y ayudar con diversas tareas de comunicación.",
  category: "Conversational",
  price: "0.1",
  rating: 4.8,
  users: 1250,
  downloads: 892,
  image: "/api/placeholder/400/300",
  tags: ["NLP", "Chatbot", "Assistant", "GPT", "Conversation"],
  owner: "0x742d35Cc6634C0532925a3b8D4C5F6f16C4A5c00",
  createdAt: "2024-01-15",
  version: "1.2.0",
  author: "AI Innovations Lab",
  ipfsCid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  verified: true,
  capabilities: [
    "Procesamiento de lenguaje natural",
    "Generación de respuestas contextuales",
    "Análisis de sentimientos",
    "Traducción multiidioma",
    "Resumen de textos"
  ],
  requirements: [
    "Node.js 16+",
    "API Key de OpenAI",
    "2GB RAM mínimo",
    "Conexión a internet"
  ],
  reviews: [
    {
      id: 1,
      user: "0x123...abc",
      rating: 5,
      comment: "Excelente agente, muy útil para customer service",
      date: "2024-01-20"
    },
    {
      id: 2,
      user: "0x456...def",
      rating: 4,
      comment: "Buena calidad pero podría mejorar la velocidad de respuesta",
      date: "2024-01-18"
    }
  ]
}

export default function AgentDetail() {
  const params = useParams()
  const { address, isConnected } = useAccount()
  const [activeTab, setActiveTab] = useState('overview')
  const [metadata, setMetadata] = useState<any>(null)
  const [rentalDuration, setRentalDuration] = useState(3600) // 1 hora por defecto

  const agentId = parseInt(params.id as string)
  
  // Hooks del contrato
  const { data: agent, isLoading: agentLoading } = useAgent(agentId)
  const { data: isRented } = useIsAgentRented(agentId)
  const { rentAgent, isPending, isConfirming, isConfirmed, error } = useRentAgent()

  // Cargar metadata desde IPFS
  useEffect(() => {
    if (agent?.ipfsHash) {
      ipfsService.retrieveMetadata(agent.ipfsHash)
        .then(setMetadata)
        .catch(console.error)
    }
  }, [agent?.ipfsHash])

  const handleRentAgent = async () => {
    if (!isConnected) {
      alert('Por favor conecta tu wallet primero')
      return
    }

    if (!agent) {
      alert('Error: Información del agente no disponible')
      return
    }

    try {
      await rentAgent(agentId, rentalDuration, agent.pricePerSecond)
    } catch (error) {
      console.error('Error renting agent:', error)
    }
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: mockAgent.name,
        text: mockAgent.description,
        url: window.location.href
      })
    } catch (error) {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header del Agente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Imagen y información principal */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gradient-to-r from-primary-500 to-primary-700 flex items-center justify-center">
                <Bot className="h-24 w-24 text-white" />
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {metadata?.name || 'Cargando...'}
                      </h1>
                      {agent?.available && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full">
                        {mockAgent.category}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span>{mockAgent.rating}</span>
                        <span>({mockAgent.users} usuarios)</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{mockAgent.downloads} descargas</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {mockAgent.createdAt}</span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  >
                    <Share className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-700 mb-4">
                  {mockAgent.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {mockAgent.tags.map(tag => (
                    <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Panel de compra */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary-600 mb-2">
                  {agent ? formatPricePerSecond(agent.pricePerSecond) : '...'} AVAX/sec
                </div>
                <div className="text-sm text-gray-600">
                  Precio por segundo • Modelo de renta
                </div>
              </div>

              {/* Selector de duración de renta */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración de Renta
                </label>
                <select
                  value={rentalDuration}
                  onChange={(e) => setRentalDuration(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={3600}>1 Hora</option>
                  <option value={3600 * 6}>6 Horas</option>
                  <option value={3600 * 12}>12 Horas</option>
                  <option value={3600 * 24}>1 Día</option>
                  <option value={3600 * 24 * 7}>1 Semana</option>
                </select>
              </div>

              <button
                onClick={handleRentAgent}
                disabled={isPending || isConfirming || !isConnected || !agent?.available || isRented}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mb-4"
              >
                {isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Confirma en wallet...</span>
                  </>
                ) : isConfirming ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Rentando...</span>
                  </>
                ) : isConfirmed ? (
                  <span>¡Rentado Exitosamente!</span>
                ) : isRented ? (
                  <span>Agente Ocupado</span>
                ) : !agent?.available ? (
                  <span>No Disponible</span>
                ) : !isConnected ? (
                  <span>Conectar Wallet</span>
                ) : (
                  <span>Rentar Agente</span>
                )}
              </button>

              {/* Mostrar costo total */}
              {agent && (
                <div className="text-center text-sm text-gray-600 mb-4">
                  Costo total: {formatPricePerSecond(agent.pricePerSecond * BigInt(rentalDuration))} AVAX
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Propietario:</span>
                  <span className="font-mono text-xs">
                    {mockAgent.owner.slice(0, 6)}...{mockAgent.owner.slice(-4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Versión:</span>
                  <span>{mockAgent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Autor:</span>
                  <span>{mockAgent.author}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IPFS CID:</span>
                  <span className="font-mono text-xs">
                    {mockAgent.ipfsCid.slice(0, 8)}...
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de información detallada */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Información General' },
                { id: 'capabilities', label: 'Capacidades' },
                { id: 'requirements', label: 'Requisitos' },
                { id: 'reviews', label: 'Reseñas' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold mb-4">Descripción Detallada</h3>
                <p className="text-gray-700 mb-6">
                  Este agente conversacional avanzado utiliza técnicas de procesamiento de lenguaje natural
                  de última generación para proporcionar interacciones naturales y coherentes. Diseñado para
                  empresas y desarrolladores que buscan integrar capacidades de IA conversacional en sus
                  aplicaciones y servicios.
                </p>
                
                <h4 className="text-md font-semibold mb-3">Casos de Uso</h4>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Atención al cliente automatizada</li>
                  <li>Asistentes virtuales para sitios web</li>
                  <li>Chatbots para aplicaciones móviles</li>
                  <li>Análisis de consultas de usuarios</li>
                  <li>Generación de respuestas personalizadas</li>
                </ul>
              </div>
            )}

            {activeTab === 'capabilities' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Capacidades del Agente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockAgent.capabilities.map((capability, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{capability}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Requisitos del Sistema</h3>
                <div className="space-y-3">
                  {mockAgent.requirements.map((requirement, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{requirement}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Reseñas de Usuarios</h3>
                <div className="space-y-4">
                  {mockAgent.reviews.map(review => (
                    <div key={review.id} className="border-b border-gray-200 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-mono text-sm text-gray-600">
                            {review.user}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-sm text-gray-500 ml-2">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}