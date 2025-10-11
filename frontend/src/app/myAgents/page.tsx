'use client'

import { Layout } from '@/components/Layout'
import { Bot, Star, TrendingUp, DollarSign, Settings, Power, Edit, Trash2, CheckCircle, XCircle, Clock, Users, Eye, Calendar, Award } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAllAgents, useSetAgentAvailability, useSetAgentPrice, useSetAgentBasePrice, useOwnerBalance, useWithdrawEarnings, type Agent as ContractAgent } from '@/hooks/useAgentRegistry'
import { formatEther, formatUnits } from 'viem'
import { fetchAgentMetadata } from '@/services/ipfs'
import { useAccount } from 'wagmi'
import Link from 'next/link'

interface AgentWithMetadata extends ContractAgent {
  name: string
  description: string
  category: string
  tags: string[]
  image: string
}

// Helper para formatear precio por segundo
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

// Helper para formatear fechas
const formatDate = (timestamp: bigint): string => {
  const date = new Date(Number(timestamp) * 1000)
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric'
  })
}

export default function MyAgents() {
  const [myAgents, setMyAgents] = useState<AgentWithMetadata[]>([])
  const [selectedAgent, setSelectedAgent] = useState<AgentWithMetadata | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [newPrice, setNewPrice] = useState('')
  const [newBasePrice, setNewBasePrice] = useState('')
  
  const { address } = useAccount()
  const { data: allAgents, isLoading } = useAllAgents()
  const { data: balance } = useOwnerBalance(address!)
  
  console.log('MyAgents page:', { address, balance, balanceString: balance?.toString() })
  
  const { 
    setAvailability, 
    isPending: isTogglingAvailability,
    isConfirming: isConfirmingAvailability,
    isConfirmed: isAvailabilityConfirmed 
  } = useSetAgentAvailability()
  
  const {
    setPrice,
    isPending: isUpdatingPrice,
    isConfirming: isConfirmingPrice,
    isConfirmed: isPriceConfirmed
  } = useSetAgentPrice()

  const {
    setBasePrice,
    isPending: isUpdatingBasePrice,
    isConfirming: isConfirmingBasePrice,
    isConfirmed: isBasePriceConfirmed
  } = useSetAgentBasePrice()

  const {
    withdrawEarnings,
    isPending: isWithdrawing,
    isConfirming: isConfirmingWithdraw,
    isConfirmed: isWithdrawConfirmed
  } = useWithdrawEarnings()

  // Filtrar solo los agentes del usuario conectado
  useEffect(() => {
    if (!allAgents || !address) return

    setMyAgents([])

    const userAgents = allAgents.filter(agent => 
      agent.owner.toLowerCase() === address.toLowerCase()
    )

    console.log('All agents:', allAgents.length)
    console.log('My agents (owner match):', userAgents.length)
    console.log('User address:', address)
    console.log('Agent owners:', allAgents.map(a => ({ id: a.id, owner: a.owner })))
    console.log('Agent prices:', allAgents.map(a => ({ 
      id: a.id, 
      basePrice: a.basePrice.toString(), 
      pricePerSecond: a.pricePerSecond.toString(),
      basePriceEth: formatEther(a.basePrice),
      pricePerSecondEth: formatEther(a.pricePerSecond)
    })))

    Promise.all(
      userAgents.map(async (agent: ContractAgent): Promise<AgentWithMetadata> => {
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
    .then(setMyAgents)
    .catch(console.error)
  }, [allAgents, address])

  // Handlers
  const handleToggleAvailability = async (agent: AgentWithMetadata) => {
    await setAvailability(Number(agent.id), !agent.available)
  }

  const handleOpenEditModal = (agent: AgentWithMetadata) => {
    setSelectedAgent(agent)
    setNewPrice(formatEther(agent.pricePerSecond))
    setNewBasePrice(formatEther(agent.basePrice))
    setIsEditModalOpen(true)
  }

  const handleUpdatePrice = async () => {
    if (!selectedAgent || !newPrice) return
    await setPrice(Number(selectedAgent.id), newPrice)
  }

  const handleUpdateBasePrice = async () => {
    if (!selectedAgent || !newBasePrice) return
    await setBasePrice(Number(selectedAgent.id), newBasePrice)
  }

  const handleWithdraw = async () => {
    await withdrawEarnings()
  }

  const handleOpenDetailsModal = (agent: AgentWithMetadata) => {
    setSelectedAgent(agent)
    setIsDetailsModalOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setSelectedAgent(null)
    document.body.style.overflow = 'auto'
  }

  // Calcular estadísticas
  const activeAgents = myAgents.filter(a => a.available).length
  const totalAgents = myAgents.length
  const totalEarnings = balance ? formatEther(balance) : '0'

  if (!address) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] to-[#0f0820] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-20 glass rounded-2xl shadow-lg border border-purple-500/30">
              <div className="bg-gradient-to-br from-purple-900 to-indigo-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                <Bot className="h-16 w-16 text-purple-300" />
              </div>
              <h2 className="text-3xl font-bold text-purple-100 mb-4">
                Conecta tu Wallet
              </h2>
              <p className="text-xl text-purple-200 mb-8">
                Para ver y gestionar tus agentes, necesitas conectar tu wallet
              </p>
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] to-[#0f0820]">
        {/* Header Section */}
        <section className="bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-900 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-5xl font-extrabold mb-4">Mis Agentes IA</h1>
                <p className="text-xl text-white/90">
                  Gestiona y monitorea tus agentes de inteligencia artificial
                </p>
              </div>
              <Link
                href="/register"
                className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 transition-all transform hover:scale-105 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50"
              >
                + Registrar Nuevo
              </Link>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass border border-purple-400/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-200 font-semibold">Total Agentes</p>
                  <Bot className="h-6 w-6 text-purple-400" />
                </div>
                <p className="text-4xl font-bold text-purple-100">{totalAgents}</p>
              </div>
              
              <div className="glass border border-green-500/30 rounded-xl p-6 shadow-lg shadow-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-200 font-semibold">Activos</p>
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
                <p className="text-4xl font-bold text-green-300">{activeAgents}</p>
              </div>
              
              <div className="glass border border-red-500/30 rounded-xl p-6 shadow-lg shadow-red-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-200 font-semibold">Inactivos</p>
                  <XCircle className="h-6 w-6 text-red-400" />
                </div>
                <p className="text-4xl font-bold text-red-300">{totalAgents - activeAgents}</p>
              </div>
              
              <div className="glass border border-yellow-500/30 rounded-xl p-6 shadow-lg shadow-yellow-500/20">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-purple-200 font-semibold">Ganancias</p>
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-yellow-300">{totalEarnings} AVAX</p>
                {Number(totalEarnings) > 0 && (
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || isConfirmingWithdraw}
                    className="mt-3 w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:from-yellow-600 hover:to-orange-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isWithdrawing || isConfirmingWithdraw ? '⏳ Retirando...' : '💰 Retirar'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Agents List Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mx-auto mb-4"></div>
                <p className="text-xl text-purple-200 font-semibold">Cargando tus agentes...</p>
              </div>
            ) : myAgents.length === 0 ? (
              <div className="text-center py-20 glass rounded-2xl shadow-lg border-2 border-dashed border-purple-500/30">
                <div className="bg-gradient-to-br from-purple-900 to-indigo-900 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/30">
                  <Bot className="h-16 w-16 text-purple-300" />
                </div>
                <h3 className="text-2xl font-bold text-purple-100 mb-3">
                  No tienes agentes registrados
                </h3>
                <p className="text-purple-200 text-lg mb-6">
                  Comienza registrando tu primer agente de IA
                </p>
                <Link
                  href="/register"
                  className="inline-block bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 hover:shadow-xl hover:shadow-purple-500/50 transition-all shadow-lg shadow-purple-500/30"
                >
                  + Registrar Primer Agente
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                {myAgents.map(agent => (
                  <div 
                    key={agent.id.toString()}
                    className="glass rounded-2xl shadow-lg shadow-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 border border-purple-500/30 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 p-6 relative">
                      <div className="absolute top-4 right-4 flex gap-2">
                        <span className="bg-purple-900/80 backdrop-blur-sm text-purple-200 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg border border-purple-400/30">
                          {agent.category}
                        </span>
                        {agent.available ? (
                          <span className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Activo
                          </span>
                        ) : (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Inactivo
                          </span>
                        )}
                      </div>
                      
                      <div className="w-20 h-20 glass border border-purple-400/30 rounded-xl flex items-center justify-center mb-3 shadow-lg">
                        <Bot className="h-10 w-10 text-purple-300" />
                      </div>
                      
                      <div className="flex items-center gap-2 glass border border-purple-400/30 px-3 py-1.5 rounded-full w-fit shadow-lg">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-bold text-purple-100">{agent.score.toString()}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 bg-gradient-to-b from-[#1a0f2e] to-[#140a24]">
                      <h3 className="text-2xl font-bold text-purple-100 mb-2">
                        {agent.name}
                      </h3>
                      
                      <p className="text-purple-200 text-sm mb-4 line-clamp-2">
                        {agent.description}
                      </p>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="glass border border-purple-500/30 rounded-lg p-3">
                          <p className="text-xs text-purple-400 font-semibold mb-1">Precio Base</p>
                          <p className="text-lg font-bold text-purple-100">
                            {formatEther(agent.basePrice)} AVAX
                          </p>
                        </div>
                        <div className="glass border border-purple-500/30 rounded-lg p-3">
                          <p className="text-xs text-purple-400 font-semibold mb-1">Por Segundo</p>
                          <p className="text-sm font-bold text-purple-300">
                            {formatPricePerSecond(agent.pricePerSecond).value}
                          </p>
                          <p className="text-xs text-purple-400 font-semibold">
                            {formatPricePerSecond(agent.pricePerSecond).unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-purple-300 mb-4">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold">Creado: {formatDate(agent.createdAt)}</span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleAvailability(agent)}
                          disabled={isTogglingAvailability || isConfirmingAvailability}
                          className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg ${
                            isTogglingAvailability || isConfirmingAvailability
                              ? 'bg-gray-700 text-gray-300 cursor-not-allowed'
                              : agent.available
                              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/30 hover:shadow-red-500/50'
                              : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/30 hover:shadow-green-500/50'
                          }`}
                        >
                          <Power className="h-4 w-4" />
                          {agent.available ? 'Desactivar' : 'Activar'}
                        </button>
                        
                        <button
                          onClick={() => handleOpenEditModal(agent)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50"
                        >
                          <Edit className="h-4 w-4" />
                          Editar Precio
                        </button>
                      </div>

                      <button
                        onClick={() => handleOpenDetailsModal(agent)}
                        className="mt-3 w-full px-4 py-3 border border-purple-500/30 glass text-purple-100 rounded-xl font-bold hover:bg-purple-900/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Modal para editar precio */}
      {isEditModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto transform transition-all">
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Actualizar Precios del Agente
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Agente: {selectedAgent.name}
                  </label>
                  
                  {/* Precio Base */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio Base (fee de activación)
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Actual: {formatEther(selectedAgent.basePrice)} AVAX
                    </p>
                    <input
                      type="number"
                      step="0.001"
                      value={newBasePrice}
                      onChange={(e) => setNewBasePrice(e.target.value)}
                      placeholder="0.01"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-900 font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 0.001 - 0.01 AVAX
                    </p>
                  </div>
                  
                  {/* Precio por Segundo */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio por Segundo
                    </label>
                    <p className="text-sm text-gray-600 mb-2">
                      Actual: {formatEther(selectedAgent.pricePerSecond)} AVAX/s
                    </p>
                    <input
                      type="number"
                      step="0.0001"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      placeholder="0.0001"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all text-gray-900 font-medium"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Recomendado: 0.0001 - 0.001 AVAX por segundo
                    </p>
                  </div>
                </div>

                {(isPriceConfirmed || isBasePriceConfirmed) && (
                  <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">
                      ✅ Precio actualizado exitosamente!
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <button
                    onClick={handleUpdateBasePrice}
                    disabled={isUpdatingBasePrice || isConfirmingBasePrice || !newBasePrice}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUpdatingBasePrice && 'Preparando...'}
                    {isConfirmingBasePrice && 'Confirmando...'}
                    {!isUpdatingBasePrice && !isConfirmingBasePrice && 'Actualizar Precio Base'}
                  </button>
                  
                  <button
                    onClick={handleUpdatePrice}
                    disabled={isUpdatingPrice || isConfirmingPrice || !newPrice}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isUpdatingPrice && 'Preparando...'}
                    {isConfirmingPrice && 'Confirmando...'}
                    {!isUpdatingPrice && !isConfirmingPrice && 'Actualizar Precio por Segundo'}
                  </button>
                  
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="w-full px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Agente */}
      {isDetailsModalOpen && selectedAgent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div 
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm transition-opacity"
            onClick={handleCloseDetailsModal}
          />
          
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-auto transform transition-all">
              
              {/* Header del Modal */}
              <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-t-2xl p-8 text-white">
                <button
                  title='Cerrar modal'
                  onClick={handleCloseDetailsModal}
                  className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XCircle className="h-6 w-6 text-white" />
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
                          Activo
                        </span>
                      ) : (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                          <XCircle className="h-4 w-4" />
                          Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-white flex-wrap">
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <Star className="h-5 w-5 fill-current text-yellow-300" />
                        <span className="font-bold">{selectedAgent.score.toString()}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                        <Calendar className="h-5 w-5" />
                        <span className="font-semibold">{formatDate(selectedAgent.createdAt)}</span>
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
                    <p className="text-sm font-semibold text-gray-700 mb-1"> Precio Base</p>
                    <p className="text-4xl font-bold text-blue-700">
                      {formatEther(selectedAgent.basePrice)}
                    </p>
                    <p className="text-lg font-bold text-blue-600 mt-1">AVAX</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 shadow-sm">
                    <p className="text-sm font-semibold text-gray-700 mb-1"> Costo por Segundo</p>
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
                      <p className="text-sm font-bold text-gray-600 mb-2"> ID del Agente</p>
                      <p className="text-xl font-bold text-blue-700">#{selectedAgent.id.toString()}</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2"> Propietario (Tú)</p>
                      <p className="text-base font-mono font-bold text-gray-900 bg-gray-100 px-3 py-2 rounded break-all">
                        {selectedAgent.owner.slice(0, 8)}...{selectedAgent.owner.slice(-6)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2"> Estado Actual</p>
                      <div className="flex items-center gap-2">
                        {selectedAgent.available ? (
                          <>
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <p className="text-base font-bold text-green-700">Activo</p>
                          </>
                        ) : (
                          <>
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <p className="text-base font-bold text-red-700">Inactivo</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2"> Puntuación</p>
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500 fill-current" />
                        <p className="text-xl font-bold text-yellow-600">{selectedAgent.score.toString()} / 100</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2"> Fecha de Creación</p>
                      <p className="text-sm font-bold text-gray-900">{formatDate(selectedAgent.createdAt)}</p>
                    </div>
                    <div className="bg-white rounded-lg p-5 border-2 border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-600 mb-2"> Blockchain</p>
                      <p className="text-base font-bold text-red-600">Avalanche Fuji</p>
                    </div>
                  </div>
                </div>

                {/* Hash IPFS */}
                <div className="mb-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border-2 border-indigo-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                     Hash IPFS
                  </h3>
                  <p className="text-sm font-mono font-bold text-indigo-700 bg-white px-4 py-3 rounded-lg break-all border border-indigo-200">
                    {selectedAgent.ipfsHash}
                  </p>
                </div>

                {/* Botones de Acción */}
                <div className="flex gap-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => {
                      handleCloseDetailsModal()
                      handleOpenEditModal(selectedAgent)
                    }}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Edit className="h-5 w-5" />
                    Editar Precios
                  </button>
                  
                  <button
                    onClick={() => handleToggleAvailability(selectedAgent)}
                    disabled={isTogglingAvailability || isConfirmingAvailability}
                    className={`flex-1 px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isTogglingAvailability || isConfirmingAvailability
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : selectedAgent.available
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <Power className="h-5 w-5" />
                    {selectedAgent.available ? 'Desactivar' : 'Activar'}
                  </button>
                  
                  <button
                    onClick={handleCloseDetailsModal}
                    className="px-6 py-3 border-2 border-gray-400 text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}