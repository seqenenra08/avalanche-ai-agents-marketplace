import { Github, Twitter, Bot, ExternalLink, Globe, Zap, Shield, Code } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Columna principal - Logo y descripción */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                <Bot className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Agents
                </span>
                <p className="text-sm text-gray-400 font-semibold">Marketplace</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6 leading-relaxed text-base max-w-md">
              Marketplace descentralizado de vanguardia para agentes de IA en la red Avalanche Fuji. 
              Descubre, registra y comercializa agentes de inteligencia artificial de forma segura.
            </p>

            {/* Características destacadas */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Shield className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Zap className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-gray-300">Ultra Rápido</span>
              </div>
            </div>
            
            {/* Redes sociales */}
            <div className="flex space-x-3">
              <a 
                title='GitHub'
                href="https://github.com" 
                className="bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 p-3 rounded-xl transition-all transform hover:scale-110 shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5 text-white" />
              </a>
              <a 
                title='Twitter'
                href="https://twitter.com" 
                className="bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 p-3 rounded-xl transition-all transform hover:scale-110 shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a 
                title='Website'
                href="#" 
                className="bg-gray-800 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 p-3 rounded-xl transition-all transform hover:scale-110 shadow-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Globe className="h-5 w-5 text-white" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              Enlaces Rápidos
            </h3>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/" 
                  className="text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-purple-500 transition-colors"></span>
                  Marketplace
                </Link>
              </li>
              <li>
                <Link 
                  href="/register" 
                  className="text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-purple-500 transition-colors"></span>
                  Registrar Agente
                </Link>
              </li>
              <li>
                <Link 
                  href="/my-agents" 
                  className="text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-2 group"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-purple-500 transition-colors"></span>
                  Mis Agentes
                </Link>
              </li>
              <li>
                <a 
                  href="https://docs.avax.network/" 
                  className="text-gray-300 hover:text-white font-medium transition-colors flex items-center gap-2 group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:bg-purple-500 transition-colors"></span>
                  Documentación
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Información de la red */}
          <div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              Red Blockchain
            </h3>
            <ul className="space-y-4">
              <li className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1 font-semibold">Red Activa</p>
                <p className="text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Avalanche Fuji
                </p>
              </li>
              <li className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
                <p className="text-xs text-gray-400 mb-1 font-semibold">Chain ID</p>
                <p className="text-white font-bold font-mono">43113</p>
              </li>
              <li>
                <a 
                  href="https://testnet.snowtrace.io/" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code className="h-4 w-4" />
                  Ver Explorer
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria con gradiente */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-8"></div>

        {/* Footer bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <p className="text-gray-400 font-medium">
              © {new Date().getFullYear()} 
              <span className="text-white font-bold mx-1">AI Agents Marketplace</span>
            </p>
            <span className="text-gray-600">•</span>
            <p className="text-gray-400 font-medium">
              Todos los derechos reservados
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
              <span className="text-white font-bold text-sm">Construido en Avalanche</span>
              <span className="text-xl">🔺</span>
            </div>
          </div>
        </div>

        {/* Badge de versión */}
        <div className="mt-6 text-center">
          <span className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 px-4 py-2 rounded-full text-xs font-bold text-gray-400 inline-flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            v1.0.0 - Testnet
          </span>
        </div>
      </div>
    </footer>
  )
}