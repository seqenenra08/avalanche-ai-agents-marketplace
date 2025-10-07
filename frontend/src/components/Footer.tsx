import { Github, Twitter, Bot } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bot className="h-8 w-8 text-primary-400" />
              <span className="text-xl font-bold">AI Agents Marketplace</span>
            </div>
            <p className="text-gray-300 mb-4">
              Marketplace descentralizado para agentes de IA en la red Avalanche Fuji. 
              Descubre, registra y comercializa agentes de inteligencia artificial.
            </p>
            <div className="flex space-x-4">
              <a 
                href="https://github.com" 
                className="text-gray-400 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-6 w-6" />
              </a>
              <a 
                href="https://twitter.com" 
                className="text-gray-400 hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-gray-300 hover:text-white">
                  Registrar Agente
                </Link>
              </li>
              <li>
                <a 
                  href="https://docs.avax.network/" 
                  className="text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Documentación
                </a>
              </li>
            </ul>
          </div>

          {/* Información de red */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Red</h3>
            <ul className="space-y-2">
              <li className="text-gray-300">
                <span className="font-medium">Red:</span> Avalanche Fuji
              </li>
              <li className="text-gray-300">
                <span className="font-medium">Chain ID:</span> 43113
              </li>
              <li>
                <a 
                  href="https://testnet.snowtrace.io/" 
                  className="text-gray-300 hover:text-white"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explorer
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} AI Agents Marketplace. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 mt-2 md:mt-0">
            Construido en Avalanche 🔺
          </p>
        </div>
      </div>
    </footer>
  )
}