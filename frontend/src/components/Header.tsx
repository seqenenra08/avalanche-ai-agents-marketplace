'use client'

import Link from 'next/link'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { Bot, Wallet, LogOut, Menu, X, Home, PlusCircle, Sparkles, CheckCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

function ConnectWalletButton() {
  const { connect, connectors, isPending } = useConnect()

  const handleConnect = () => {
    const injectedConnector = connectors.find(connector => connector.id === 'injected')
    if (injectedConnector) connect({ connector: injectedConnector })
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={isPending}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:cursor-not-allowed"
    >
      <Wallet className="h-5 w-5" />
      <span>{isPending ? 'Conectando...' : 'Conectar Wallet'}</span>
    </button>
  )
}

export function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`

  if (!mounted) {
    return (
      <header className="bg-white shadow-lg border-b-2 border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Agents
                </span>
                <p className="text-xs text-gray-600 font-semibold">Marketplace</p>
              </div>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b-2 border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo mejorado */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:shadow-xl transition-all transform group-hover:scale-110">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Agents
              </span>
              <p className="text-xs text-gray-600 font-semibold">Marketplace</p>
            </div>
          </Link>

          {/* Desktop Navigation mejorado */}
          <nav className="hidden md:flex items-center gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all group"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Marketplace
            </Link>
            <Link 
              href="/register" 
              className="flex items-center gap-2 text-gray-700 hover:text-purple-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-50 transition-all group"
            >
              <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Registrar Agente
            </Link>
            <Link 
              href="/myAgents" 
              className="flex items-center gap-2 text-gray-700 hover:text-green-600 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-50 transition-all group"
            >
              <Sparkles className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Mis Agentes
            </Link>
          </nav>

          {/* Wallet Connection mejorado */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <div className="flex items-center gap-3">
                {/* Badge de conexión */}
                <div className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl px-4 py-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Wallet className="h-5 w-5 text-green-700" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-xs text-green-600 font-bold">Conectado</p>
                      <p className="text-sm font-mono font-bold text-gray-900">{formatAddress(address!)}</p>
                    </div>
                  </div>
                </div>

                {/* Versión mobile del badge */}
                <div className="sm:hidden flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl px-3 py-2">
                  <Wallet className="h-4 w-4 text-green-700" />
                  <span className="text-xs font-mono font-bold text-gray-900">{formatAddress(address!)}</span>
                </div>

                {/* Botón de desconectar */}
                <button
                  onClick={() => disconnect()}
                  className="p-2.5 text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all border-2 border-red-200 hover:border-red-600 shadow-sm hover:shadow-lg transform hover:scale-105"
                  title="Desconectar wallet"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <ConnectWalletButton />
            )}

            {/* Mobile menu button mejorado */}
            <button
              className="md:hidden p-2.5 rounded-xl text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-2 border-gray-200 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation mejorado */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top">
            <div className="space-y-2 border-t-2 border-gray-200 pt-4">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Marketplace
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-700 hover:text-purple-600 hover:bg-purple-50 transition-all group"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Registrar Agente
              </Link>
              <Link
                href="/my-agents"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 transition-all group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Mis Agentes
              </Link>

              {/* Status de conexión en mobile */}
              {isConnected && (
                <div className="mt-4 pt-4 border-t-2 border-gray-200">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-bold text-green-700">Wallet Conectada</span>
                    </div>
                    <p className="text-sm font-mono font-bold text-gray-900">{address}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}