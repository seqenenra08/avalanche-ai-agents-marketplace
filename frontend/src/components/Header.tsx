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
      className="bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 hover:from-purple-700 hover:via-purple-800 hover:to-indigo-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 transition-all transform hover:scale-105 disabled:cursor-not-allowed"
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
      <header className="glass border-b border-purple-500/20 shadow-xl shadow-purple-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Link href="/" className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-purple-500/30">
                <Bot className="h-7 w-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Avagent
                </span>
                <p className="text-xs text-purple-300 font-semibold">Marketplace</p>
              </div>
            </Link>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 glass backdrop-blur-xl border-b border-purple-500/20 shadow-xl shadow-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo mejorado */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 p-2.5 rounded-xl shadow-lg shadow-purple-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/50 transition-all transform group-hover:scale-110">
              <Bot className="h-7 w-7 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Avagent
              </span>
              <p className="text-xs text-purple-300 font-semibold">Marketplace</p>
            </div>
          </Link>

          {/* Desktop Navigation mejorado */}
          <nav className="hidden md:flex items-center gap-2">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-purple-200 hover:text-purple-100 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-900/30 transition-all group"
            >
              <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Marketplace
            </Link>
            <Link 
              href="/register" 
              className="flex items-center gap-2 text-purple-200 hover:text-purple-100 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-900/30 transition-all group"
            >
              <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              Registrar Agente
            </Link>
            <Link 
              href="/myAgents" 
              className="flex items-center gap-2 text-purple-200 hover:text-purple-100 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-purple-900/30 transition-all group"
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
                <div className="hidden sm:flex items-center gap-2 glass border border-purple-500/30 rounded-xl px-4 py-2.5 shadow-lg shadow-purple-500/20">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Wallet className="h-5 w-5 text-purple-300" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-purple-900 animate-pulse"></div>
                    </div>
                    <div>
                      <p className="text-xs text-purple-400 font-bold">Conectado</p>
                      <p className="text-sm font-mono font-bold text-purple-100">{formatAddress(address!)}</p>
                    </div>
                  </div>
                </div>

                {/* Versión mobile del badge */}
                <div className="sm:hidden flex items-center gap-2 glass border border-purple-500/30 rounded-xl px-3 py-2">
                  <Wallet className="h-4 w-4 text-purple-300" />
                  <span className="text-xs font-mono font-bold text-purple-100">{formatAddress(address!)}</span>
                </div>

                {/* Botón de desconectar */}
                <button
                  onClick={() => disconnect()}
                  className="p-2.5 text-red-400 hover:text-white hover:bg-red-600 rounded-xl transition-all border border-red-500/30 hover:border-red-600 shadow-sm hover:shadow-lg hover:shadow-red-500/30 transform hover:scale-105"
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
              className="md:hidden p-2.5 rounded-xl text-purple-200 hover:text-purple-100 hover:bg-purple-900/30 border border-purple-500/30 transition-all"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation mejorado */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-in slide-in-from-top">
            <div className="space-y-2 border-t border-purple-500/20 pt-4">
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30 transition-all group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Marketplace
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30 transition-all group"
                onClick={() => setIsMenuOpen(false)}
              >
                <PlusCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Registrar Agente
              </Link>
              <Link
                href="/myAgents"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold text-purple-200 hover:text-purple-100 hover:bg-purple-900/30 transition-all group"
                onClick={() => setIsMenuOpen(false)}
              >
                <Sparkles className="h-5 w-5 group-hover:scale-110 transition-transform" />
                Mis Agentes
              </Link>

              {/* Status de conexión en mobile */}
              {isConnected && (
                <div className="mt-4 pt-4 border-t border-purple-500/20">
                  <div className="glass border border-purple-500/30 rounded-xl p-4 shadow-lg shadow-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-bold text-purple-300">Wallet Conectada</span>
                    </div>
                    <p className="text-sm font-mono font-bold text-purple-100 break-all">{address}</p>
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