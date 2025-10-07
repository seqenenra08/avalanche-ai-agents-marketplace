'use client'

import Link from 'next/link'
import { useAccount, useDisconnect, useConnect } from 'wagmi'
import { Bot, Wallet, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

function ConnectWalletButton() {
  const { connect, connectors, isPending } = useConnect()

  const handleConnect = () => {
    // Usar el conector injected (MetaMask)
    const injectedConnector = connectors.find(connector => connector.id === 'injected')
    if (injectedConnector) {
      connect({ connector: injectedConnector })
    }
  }

  return (
    <button 
      onClick={handleConnect}
      disabled={isPending}
      className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 cursor-pointer hover:text-gray-900"
    >
      <Wallet className="h-4 w-4" />
      <span>{isPending ? 'Conectando...' : 'Conectar Wallet'}</span>
    </button>
  )
}

export function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Bot className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">
              AI Agents Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Marketplace
            </Link>
            <Link 
              href="/register" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Registrar Agente
            </Link>
          </nav>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-3 py-2 text-gray-600">
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">
                    {formatAddress(address!)}
                  </span>
                </div>
                <button
                  onClick={() => disconnect()}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  title="Desconectar wallet"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <ConnectWalletButton />
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Marketplace
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                Registrar Agente
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}