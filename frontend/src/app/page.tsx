'use client'

import { Layout } from '@/components/Layout'
import { Search, Bot, Star, Users, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Mock data para los agentes (esto vendrá del contrato más adelante)
const mockAgents = [
  {
    id: 1,
    name: "ChatBot Assistant",
    description: "Asistente conversacional avanzado con capacidades de procesamiento de lenguaje natural",
    category: "Conversational",
    price: "0.1 AVAX",
    rating: 4.8,
    users: 1250,
    image: "/api/placeholder/300/200",
    tags: ["NLP", "Chatbot", "Assistant"]
  },
  {
    id: 2,
    name: "Data Analyzer Pro",
    description: "Análisis avanzado de datos con machine learning y visualizaciones interactivas",
    category: "Analytics",
    price: "0.25 AVAX",
    rating: 4.9,
    users: 890,
    image: "/api/placeholder/300/200",
    tags: ["Analytics", "ML", "Data"]
  },
  {
    id: 3,
    name: "Image Generator AI",
    description: "Generación de imágenes artísticas usando inteligencia artificial avanzada",
    category: "Creative",
    price: "0.15 AVAX",
    rating: 4.7,
    users: 2100,
    image: "/api/placeholder/300/200",
    tags: ["Image", "Creative", "Art"]
  },
  {
    id: 4,
    name: "Trading Assistant",
    description: "Asistente de trading con análisis técnico y alertas automatizadas",
    category: "Finance",
    price: "0.3 AVAX",
    rating: 4.6,
    users: 650,
    image: "/api/placeholder/300/200",
    tags: ["Trading", "Finance", "Analytics"]
  }
]

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Conversational', 'Analytics', 'Creative', 'Finance']

  const filteredAgents = mockAgents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Marketplace de Agentes IA
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Descubre, compra y vende agentes de inteligencia artificial en Avalanche
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Registrar Agente
              </Link>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors">
                Explorar Marketplace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Bot className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">150+</h3>
              <p className="text-gray-600">Agentes IA Disponibles</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">5,000+</h3>
              <p className="text-gray-600">Usuarios Activos</p>
            </div>
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <TrendingUp className="h-12 w-12 text-primary-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">25,000</h3>
              <p className="text-gray-600">Transacciones Completadas</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar agentes IA..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAgents.map(agent => (
              <div key={agent.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                      {agent.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{agent.rating}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {agent.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {agent.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {agent.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-primary-600">
                      {agent.price}
                    </span>
                    <span className="text-sm text-gray-500">
                      {agent.users} usuarios
                    </span>
                  </div>

                  <Link
                    href={`/agent/${agent.id}`}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center block"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron agentes
              </h3>
              <p className="text-gray-600">
                Intenta ajustar tus filtros de búsqueda
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
