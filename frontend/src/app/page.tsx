'use client'

import { Layout } from '@/components/Layout'
import { Search, Bot, Star, Calendar, Sparkles, Clock, CheckCircle, XCircle, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAllAgents, useRentAgent, useIsAgentRented, type Agent as ContractAgent } from '@/hooks/useAgentRegistry'
import { formatEther } from 'viem'
import { fetchAgentMetadata } from '@/services/ipfs'

export interface AgentWithMetadata extends ContractAgent {
  name: string
  description: string
  category: string
  tags: string[]
  image: string
}

const formatDate = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPricePerSecond = (pricePerSecond: bigint): { value: string; unit: string } => {
  const weiValue = Number(pricePerSecond)
  const avaxValue = Number(formatEther(pricePerSecond))
  
  if (avaxValue >= 0.001) {
    return {
      value: avaxValue.toFixed(6),
      unit: 'AVAX/s'
    }
  }
  
  const microAvaxValue = weiValue / 1000000000000
  return {
    value: microAvaxValue.toFixed(2),
    unit: 'μAVAX/s'
  }
}

// Componente para mostrar el estado de rentado
const RentalStatus = ({ agentId }: { agentId: bigint }) => {
  const { data: isRented, isLoading, refetch } = useIsAgentRented(Number(agentId))
  
  // Forzar actualización cada 3 segundos adicionales por si acaso
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [refetch])
  
  if (isLoading) {
    return (
      <span className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
        <Clock className="h-3 w-3" />
        Verificando...
      </span>
    )
  }
  
  if (isRented) {
    return (
      <span className="bg-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Rentado
      </span>
    )
  }
  
  return (
    <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
      <CheckCircle className="h-3 w-3" />
      Libre
    </span>
  )
}

// Componente para mostrar el estado de rentado en el modal
const RentalStatusModal = ({ agentId }: { agentId: bigint }) => {
  const { data: isRented, isLoading, refetch } = useIsAgentRented(Number(agentId))
  
  // Forzar actualización cada 3 segundos adicionales por si acaso
  useEffect(() => {
    const interval = setInterval(() => {
      refetch()
    }, 3000)
    
    return () => clearInterval(interval)
  }, [refetch])
  
  if (isLoading) {
    return (
      <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 animate-pulse">
        <Clock className="h-4 w-4" />
        Verificando...
      </span>
    )
  }
  
  if (isRented) {
    return (
      <span className="bg-orange-500/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
        <Clock className="h-4 w-4" />
        Rentado
      </span>
    )
  }
  
  return (
    <span className="bg-emerald-500/90 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
      <CheckCircle className="h-4 w-4" />
      Libre
    </span>
  )
}

const getTimeSinceCreation = (timestamp: bigint): string => {
  const now = Date.now()
  const created = Number(timestamp) * 1000
  const diff = now - created
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Hace 1 día'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
  return `Hace ${Math.floor(days / 30)} meses`
}

export default function Home() {
  const [agents, setAgents] = useState<AgentWithMetadata[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAgent, setSelectedAgent] = useState<AgentWithMetadata | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAvailableOnly, setShowAvailableOnly] = useState(false)
  const [rentalMinutes, setRentalMinutes] = useState<string>('60')

  const categories = ['all', 'Conversational', 'Analytics', 'Creative', 'Finance']

  const { data, isLoading, error } = useAllAgents()
  const { 
    rentAgent,
    isPending: isRenting, 
    isConfirming: isConfirmingRent,
    isConfirmed: isRentConfirmed 
  } = useRentAgent()

  useEffect(() => {
    if (!data) return

    setAgents([])

    Promise.all(
      data.map(async (agent: ContractAgent): Promise<AgentWithMetadata> => {
        const metadata = await fetchAgentMetadata(agent.ipfsHash)
        return {
          ...agent,
          name: metadata.name,
          description: metadata.description,
          category: metadata.category,
          tags: metadata.tags || [],
          image: metadata.image
        }
      })
    )
    .then(setAgents)
    .catch(console.error)
  }, [data])

  // Efecto para manejar confirmación de renta
  useEffect(() => {
    if (isRentConfirmed) {
      setIsModalOpen(false)
      setSelectedAgent(null)
      document.body.style.overflow = 'auto'
      // Los hooks ya se actualizarán automáticamente con refetchInterval
    }
  }, [isRentConfirmed])

  const openModal = (agent: AgentWithMetadata) => {
    setSelectedAgent(agent)
    setIsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedAgent(null)
    setRentalMinutes('60')
    document.body.style.overflow = 'unset'
  }

  const handleRentAgent = async () => {
    if (!selectedAgent || !rentalMinutes) return
    
    const minutes = parseInt(rentalMinutes)
    if (isNaN(minutes) || minutes <= 0) {
      alert('Por favor ingresa un número válido de minutos')
      return
    }

    const durationSeconds = minutes * 60
    
    // Pasar tanto pricePerSecond como basePrice al hook
    await rentAgent(
      Number(selectedAgent.id), 
      durationSeconds, 
      selectedAgent.pricePerSecond,
      selectedAgent.basePrice
    )
  }

  const calculateEstimatedCost = () => {
    if (!selectedAgent || !rentalMinutes) return '0'
    
    const minutes = parseInt(rentalMinutes)
    if (isNaN(minutes) || minutes <= 0) return '0'
    
    const durationSeconds = minutes * 60
    const timeCost = selectedAgent.pricePerSecond * BigInt(durationSeconds)
    const totalCost = selectedAgent.basePrice + timeCost
    
    return formatEther(totalCost)
  }

  useEffect(() => {
    if (isRentConfirmed) {
      console.log('✅ Agente rentado exitosamente')
      setTimeout(() => {
        closeModal()
      }, 3000)
    }
  }, [isRentConfirmed])

  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory =
      selectedCategory === 'all' || agent.category === selectedCategory
    
    const matchesAvailability = !showAvailableOnly || agent.available
    
    return matchesSearch && matchesCategory && matchesAvailability
  })

  const availableCount = agents.filter(a => a.available).length

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30">
                <p className="text-white font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Plataforma Descentralizada de IA
                </p>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              Marketplace de <br />
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Agentes IA
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 text-white/90 max-w-3xl mx-auto">
              Descubre, renta y utiliza los mejores agentes de inteligencia artificial construidos sobre Avalanche
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-700 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl"
              >
                🚀 Registrar Agente
              </Link>
              <button 
                type='button' 
                className="border-3 border-white bg-white/10 backdrop-blur-sm text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-700 transition-all transform hover:scale-105"
              >
                🔍 Explorar Marketplace
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-4xl font-bold mb-2">{agents.length}</p>
                <p className="text-white/80 font-semibold">Agentes Registrados</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-4xl font-bold mb-2">{availableCount}</p>
                <p className="text-white/80 font-semibold">Disponibles Ahora</p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <p className="text-4xl font-bold mb-2">100%</p>
                <p className="text-white/80 font-semibold">Descentralizado</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Explora Nuestros Agentes IA
            </h2>
            <p className="text-xl text-gray-600">
              Encuentra el agente perfecto para tus necesidades
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-4 h-6 w-6 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, descripción o capacidades..."
                  className="w-full pl-14 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-900 font-medium placeholder:text-gray-500 shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                title="Filtrar por categoría"
                className="px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 bg-white text-gray-900 font-bold shadow-sm cursor-pointer hover:border-blue-400 transition-all"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category} className="font-bold">
                    {category === 'all' ? '🌐 Todas las categorías' : `📁 ${category}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-3 cursor-pointer bg-white px-4 py-3 rounded-xl border-2 border-gray-300 hover:border-blue-400 transition-all shadow-sm">
                <input
                  type="checkbox"
                  checked={showAvailableOnly}
                  onChange={(e) => setShowAvailableOnly(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="font-semibold text-gray-900">
                  Mostrar solo disponibles ({availableCount})
                </span>
              </label>
            </div>
          </div>

          {filteredAgents.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-700 font-semibold text-lg">
                📊 Mostrando <span className="text-blue-600 font-bold">{filteredAgents.length}</span> agente{filteredAgents.length !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAgents.map(agent => (
              <div 
                key={agent.id.toString()} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 overflow-hidden group flex flex-col h-full"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 relative flex-shrink-0">
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <span className="bg-white text-blue-700 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                      {agent.category}
                    </span>
                    {agent.available ? (
                      <span className="bg-green-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Disponible
                      </span>
                    ) : (
                      <span className="bg-red-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        No disponible
                      </span>
                    )}
                    {/* Estado de rentado */}
                    <RentalStatus agentId={agent.id} />
                  </div>
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
                    <Bot className="h-10 w-10 text-blue-600" />
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full w-fit">
                    <Star className="h-4 w-4 text-yellow-300 fill-current" />
                    <span className="text-sm font-bold text-white">{agent.score.toString()}</span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors h-14 line-clamp-2">
                    {agent.name}
                  </h3>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-3 leading-relaxed h-16">
                    {agent.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-5 h-16 overflow-hidden">
                    {agent.tags.slice(0, 3).map((tag: string) => (
                      <span 
                        key={tag} 
                        className="bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 px-3 py-1 rounded-lg text-xs font-bold border border-blue-200 h-fit"
                      >
                        {tag}
                      </span>
                    ))}
                    {agent.tags.length > 3 && (
                      <span className="text-xs text-gray-500 font-semibold h-fit">+{agent.tags.length - 3}</span>
                    )}
                  </div>

                  <div className="flex-grow"></div>

                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-semibold">{getTimeSinceCreation(agent.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between mb-5 pt-4 border-t-2 border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 font-semibold mb-1">Precio Base</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatEther(agent.basePrice)} 
                        <span className="text-sm font-bold text-red-600 ml-1">AVAX</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold mb-1">Score</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-lg font-bold text-gray-900">{agent.score.toString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openModal(agent)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3.5 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Ver Detalles Completos
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-300">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
                <Bot className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No se encontraron agentes
              </h3>
              <p className="text-gray-600 text-lg mb-6">
                Intenta ajustar tus filtros de búsqueda o explorar otras categorías
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setShowAvailableOnly(false)
                }}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalles con Renta Integrada */}
      {isModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all">
              {/* Header del Modal */}
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-t-2xl p-8 text-white">
                <button
                  title='Cerrar modal'
                  onClick={closeModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
                
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-xl bg-white flex items-center justify-center overflow-hidden shadow-lg">
                    <Bot className="h-12 w-12 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-3xl font-bold text-white">{selectedAgent.name}</h2>
                      <span className="bg-white text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        {selectedAgent.category}
                      </span>
                      {selectedAgent.available ? (
                        <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          Disponible
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          No disponible
                        </span>
                      )}
                      {/* Estado de rentado en el modal */}
                      <RentalStatusModal agentId={selectedAgent.id} />
                    </div>
                    <div className="flex items-center gap-4 text-white flex-wrap">
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <Star className="h-5 w-5 fill-current text-yellow-300" />
                        <span className="font-bold">{selectedAgent.score.toString()}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <Calendar className="h-5 w-5" />
                        <span className="font-semibold">{getTimeSinceCreation(selectedAgent.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="p-8 max-h-[70vh] overflow-y-auto">
                {/* Precios destacados */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-1">💰 Precio Base</p>
                    <p className="text-4xl font-bold text-blue-700">
                      {formatEther(selectedAgent.basePrice)}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-1">AVAX</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-1">⏱️ Costo por Segundo</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-bold text-purple-700">
                        {formatPricePerSecond(selectedAgent.pricePerSecond).value}
                      </p>
                      <p className="text-base font-bold text-purple-600">
                        {formatPricePerSecond(selectedAgent.pricePerSecond).unit}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Descripción */}
                <div className="mb-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                    Descripción Completa
                  </h3>
                  <p className="text-gray-800 leading-relaxed text-base">{selectedAgent.description}</p>
                </div>

                {/* Capacidades y Tags */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                    Capacidades y Especialidades
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedAgent.tags.map((tag: string) => (
                      <span 
                        key={tag} 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Información Técnica */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                    Información Técnica
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2">👤 Propietario</p>
                      <p className="text-base font-mono font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded break-all">
                        {selectedAgent.owner.slice(0, 8)}...{selectedAgent.owner.slice(-6)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2">🆔 ID del Agente</p>
                      <p className="text-xl font-bold text-blue-700">#{selectedAgent.id.toString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2">📊 Estado</p>
                      <div className="flex items-center gap-2">
                        {selectedAgent.available ? (
                          <>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-base font-bold text-green-700">Disponible</p>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <p className="text-base font-bold text-red-700">No disponible</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2">📅 Fecha de Creación</p>
                      <p className="text-sm font-bold text-gray-900">{formatDate(selectedAgent.createdAt)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2">🔗 Blockchain</p>
                      <p className="text-base font-bold text-red-600">Avalanche</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2">⭐ Puntuación</p>
                      <p className="text-base font-bold text-yellow-600">{selectedAgent.score.toString()} / 100</p>
                    </div>
                  </div>
                </div>

                {/* Sección de Renta Integrada */}
                <div className="pt-6 border-t-2 border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                    💳 Rentar este Agente
                  </h3>

                  {selectedAgent.available ? (
                    <div className="space-y-4">
                      {/* Input de minutos */}
                      <div>
                        <label className="block text-base font-bold text-gray-900 mb-2">
                          ⏰ Tiempo de Renta (minutos)
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={rentalMinutes}
                          onChange={(e) => setRentalMinutes(e.target.value)}
                          placeholder="60"
                          className="w-full px-6 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-900 font-bold text-xl text-center"
                        />
                        
                        {/* Botones rápidos */}
                        <div className="grid grid-cols-4 gap-2 mt-2">
                          <button
                            onClick={() => setRentalMinutes('30')}
                            className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold text-xs transition-all"
                          >
                            30 min
                          </button>
                          <button
                            onClick={() => setRentalMinutes('60')}
                            className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold text-xs transition-all"
                          >
                            1 hora
                          </button>
                          <button
                            onClick={() => setRentalMinutes('180')}
                            className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold text-xs transition-all"
                          >
                            3 horas
                          </button>
                          <button
                            onClick={() => setRentalMinutes('1440')}
                            className="px-2 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-bold text-xs transition-all"
                          >
                            1 día
                          </button>
                        </div>
                      </div>

                      {/* Resumen del costo */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                        <h4 className="text-base font-bold text-gray-900 mb-3">📊 Resumen del Costo</h4>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-semibold">Precio Base:</span>
                            <span className="text-gray-900 font-bold">{formatEther(selectedAgent.basePrice)} AVAX</span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-semibold">Tiempo:</span>
                            <span className="text-gray-900 font-bold">
                              {rentalMinutes} min ({(parseInt(rentalMinutes || '0') / 60).toFixed(2)} h)
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 font-semibold">Costo por Tiempo:</span>
                            <span className="text-gray-900 font-bold">
                              {rentalMinutes && !isNaN(parseInt(rentalMinutes)) 
                                ? formatEther(selectedAgent.pricePerSecond * BigInt(parseInt(rentalMinutes) * 60))
                                : '0'} AVAX
                            </span>
                          </div>
                          
                          <div className="border-t-2 border-green-300 pt-2 mt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Total:</span>
                              <span className="text-2xl font-bold text-green-700">
                                {calculateEstimatedCost()} AVAX
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mensajes de estado */}
                      {(isRenting || isConfirmingRent) && (
                        <div className="p-3 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                          <p className="text-center text-yellow-800 font-semibold text-sm">
                            ⏳ {isRenting ? 'Preparando transacción...' : 'Confirmando en blockchain...'}
                          </p>
                        </div>
                      )}

                      {isRentConfirmed && (
                        <div className="p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                          <p className="text-center text-green-800 font-bold">
                            ✅ ¡Agente rentado exitosamente!
                          </p>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleRentAgent}
                          disabled={isRenting || isConfirmingRent || !rentalMinutes || parseInt(rentalMinutes) <= 0}
                          className="flex-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isRenting || isConfirmingRent ? (
                            <>
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Procesando...
                            </>
                          ) : (
                            <>
                              🚀 Confirmar Renta
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={closeModal}
                          disabled={isRenting || isConfirmingRent}
                          className="px-6 py-4 border-2 border-gray-400 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all text-lg disabled:opacity-50"
                        >
                          Cerrar
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 text-center">
                        💡 El pago incluye el precio base más el costo por el tiempo seleccionado
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 text-center">
                      <XCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
                      <p className="text-red-700 font-bold text-lg mb-2">Agente No Disponible</p>
                      <p className="text-red-600 text-sm">Este agente no está disponible para rentar en este momento</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}