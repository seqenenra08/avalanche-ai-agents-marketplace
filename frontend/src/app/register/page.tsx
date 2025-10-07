'use client'

import { Layout } from '@/components/Layout'
import { Upload, Bot, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { useAccount } from 'wagmi'
import { ipfsService, type AgentMetadata } from '@/services/ipfs'
import { useRegisterAgent } from '@/hooks/useAgentRegistry'

interface AgentFormData {
  name: string
  description: string
  category: string
  price: string
  tags: string[]
  image: File | null
  metadata: {
    version: string
    author: string
    requirements: string[]
    capabilities: string[]
  }
}

export default function RegisterAgent() {
  const { address, isConnected } = useAccount()
  const { registerAgent, isPending, isConfirming, isConfirmed, hash, error } = useRegisterAgent()
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    category: '',
    price: '',
    tags: [],
    image: null,
    metadata: {
      version: '1.0.0',
      author: '',
      requirements: [],
      capabilities: []
    }
  })
  const [currentTag, setCurrentTag] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [ipfsCid, setIpfsCid] = useState<string | null>(null)

  const categories = [
    'Conversational',
    'Analytics', 
    'Creative',
    'Finance',
    'Healthcare',
    'Education',
    'Gaming',
    'Other'
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    if (name.startsWith('metadata.')) {
      const metadataField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          [metadataField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }))
      setCurrentTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }))
    }
  }

  const uploadToIPFS = async (metadata: AgentMetadata) => {
    try {
      setIsUploading(true)
      setUploadStatus('uploading')
      
      // Subir imagen primero si existe
      let imageCid = null
      if (formData.image) {
        const imageResult = await ipfsService.uploadImage(formData.image)
        imageCid = imageResult.cid
      }

      // Actualizar metadata con el CID de la imagen
      const metadataWithImage = {
        ...metadata,
        image: imageCid
      }
      
      // Subir metadatos a IPFS
      const result = await ipfsService.uploadJSON(metadataWithImage)
      setIpfsCid(result.cid)
      setUploadStatus('success')
      
      return result.cid
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      setUploadStatus('error')
      throw error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      alert('Por favor conecta tu wallet primero')
      return
    }

    try {
      // Verificar que address existe
      if (!address) {
        alert('Error: No se pudo obtener la dirección de la wallet')
        return
      }

      // Preparar metadatos para IPFS
      const metadata: AgentMetadata = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        tags: formData.tags,
        metadata: formData.metadata,
        image: null, // Se actualizará en uploadToIPFS si hay imagen
        createdAt: new Date().toISOString(),
        owner: address
      }

      // Subir a IPFS
      const cid = await uploadToIPFS(metadata)
      
      // Registrar en el contrato inteligente
      console.log('Metadata uploaded to IPFS with CID:', cid)
      console.log('Registering agent in smart contract with price:', formData.price, 'AVAX per second')
      
      // Convertir precio de AVAX total a precio por segundo
      // Asumimos que el precio ingresado es por hora, lo convertimos a por segundo
      const pricePerHour = parseFloat(formData.price)
      const pricePerSecond = (pricePerHour / 3600).toString() // convertir a precio por segundo
      
      await registerAgent(cid, pricePerSecond)
      
    } catch (error) {
      console.error('Error registering agent:', error)
    }
  }

  if (!isConnected) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Conecta tu Wallet
            </h2>
            <p className="text-gray-600">
              Necesitas conectar tu wallet para registrar un agente en el marketplace
            </p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registrar Nuevo Agente IA
          </h1>
          <p className="text-gray-600">
            Completa la información de tu agente para agregarlo al marketplace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Básica */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Información Básica
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Agente *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ej: Mi Asistente IA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe las funcionalidades y capacidades de tu agente..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio (AVAX) *
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  step="0.001"
                  min="0"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="0.1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagen del Agente
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tags y Etiquetas
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Agregar tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Agregar
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-primary-600 hover:text-primary-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Metadatos Técnicos */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Metadatos Técnicos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versión
                </label>
                <input
                  type="text"
                  name="metadata.version"
                  value={formData.metadata.version}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Autor
                </label>
                <input
                  type="text"
                  name="metadata.author"
                  value={formData.metadata.author}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Tu nombre o organización"
                />
              </div>
            </div>
          </div>

          {/* Estado de Subida a IPFS */}
          {uploadStatus !== 'idle' && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Estado de Subida
              </h2>
              
              <div className="flex items-center space-x-3">
                {uploadStatus === 'uploading' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-gray-600">Subiendo metadatos a IPFS...</span>
                  </>
                )}
                
                {uploadStatus === 'success' && (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-green-600 font-medium">Subida exitosa!</span>
                      <p className="text-sm text-gray-600">CID: {ipfsCid}</p>
                    </div>
                  </>
                )}
                
                {uploadStatus === 'error' && (
                  <>
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span className="text-red-600">Error al subir a IPFS</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Estado de transacción blockchain */}
          {(isPending || isConfirming || isConfirmed || error) && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Estado de Transacción
              </h2>
              
              <div className="space-y-3">
                {isPending && (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-gray-600">Esperando confirmación en wallet...</span>
                  </div>
                )}
                
                {isConfirming && (
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                    <span className="text-gray-600">Registrando en blockchain...</span>
                  </div>
                )}
                
                {isConfirmed && (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <span className="text-green-600 font-medium">¡Agente registrado exitosamente!</span>
                      {hash && (
                        <p className="text-sm text-gray-600">
                          Tx: <span className="font-mono">{hash.slice(0, 10)}...{hash.slice(-8)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <span className="text-red-600 font-medium">Error en transacción</span>
                      <p className="text-sm text-gray-600">{error.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUploading || isPending || isConfirming}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Subiendo a IPFS...</span>
                </>
              ) : isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Confirma en wallet...</span>
                </>
              ) : isConfirming ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Registrando...</span>
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>¡Registrado!</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Registrar Agente</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  )
}