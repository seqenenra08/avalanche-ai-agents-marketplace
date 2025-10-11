'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/Layout'
import { useAccount, useBalance } from 'wagmi'
import { parseUnits, formatEther } from 'viem'
import { useRegisterAgent } from '@/hooks/useAgentRegistry'
import { 
  Bot, 
  Upload, 
  FileText, 
  Link as LinkIcon, 
  Tag, 
  DollarSign, 
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Globe,
  BookOpen,
  PackageCheck,
  Wallet
} from 'lucide-react'

export default function AgentForm() {
  const { address, isConnected } = useAccount()
  const { registerAgent, isPending, isConfirming, isConfirmed, error } = useRegisterAgent()
  
  // Obtener balance del usuario
  const { data: balanceData, isLoading: isLoadingBalance } = useBalance({
    address: address,
  })

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    category: '',
    documentation: '',
    version: '1.0.0',
    tags: '',
    pricePerSecond: '',
    basePrice: '',
  })

  const [status, setStatus] = useState<'idle' | 'uploading' | 'registering' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [hasInsufficientFunds, setHasInsufficientFunds] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected) {
      setStatus('error');
      setMessage('Por favor conecta tu wallet primero');
      return;
    }
    
    if (!address) {
      setStatus('error');
      setMessage('No se pudo obtener tu dirección de wallet');
      return;
    }

    // Validar que el usuario tenga balance
    if (!balanceData || balanceData.value === BigInt(0)) {
      setStatus('error');
      setMessage('❌ No tienes AVAX en tu wallet. Necesitas fondos para pagar el gas de la transacción.');
      setHasInsufficientFunds(true);
      return;
    }

    // Estimar el gas requerido (aproximadamente 0.01 AVAX para transacciones en Fuji)
    const minimumBalance = parseUnits('0.01', 18); // 0.01 AVAX
    
    if (balanceData.value < minimumBalance) {
      setStatus('error');
      setMessage(`❌ Balance insuficiente. Tienes ${formatEther(balanceData.value)} AVAX, pero necesitas al menos 0.01 AVAX para cubrir el gas de la transacción.`);
      setHasInsufficientFunds(true);
      return;
    }

    // Reset insufficient funds flag
    setHasInsufficientFunds(false);

    try {
      setStatus('uploading');
      setMessage('Subiendo metadata a IPFS...');

      const bodyData = {
        name: formData.name,
        description: formData.description,
        endpoint: formData.endpoint,
        category: formData.category,
        documentation: formData.documentation || '',
        version: formData.version,
        tags: formData.tags.split(',').map(tag => tag.trim()),
        owner: address,
      };

      console.log('📤 Enviando a gateway:', bodyData);

      const response = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.NEXT_PUBLIC_MY_API_KEY || '',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          endpoint: formData.endpoint,
          category: formData.category,
          documentation: formData.documentation,
          version: formData.version,
          tags: formData.tags.split(',').map(tag => tag.trim()),
          owner: address,
        }),
      });

      const text = await response.text();
      console.log('📥 Respuesta del servidor (raw):', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        throw new Error(
          `La respuesta no es JSON válido. El servidor respondió con: ${text.substring(0, 200)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Error subiendo a IPFS');
      }

      const ipfsHash = data.ipfsHash;
      if (!ipfsHash) {
        throw new Error('El servidor no devolvió un ipfsHash válido');
      }

      console.log('✅ IPFS Hash recibido:', ipfsHash);

      setStatus('registering');
      setMessage('Registrando agente en blockchain...');

      await registerAgent(ipfsHash, formData.pricePerSecond, formData.basePrice || "0");

      setStatus('success');
      setMessage('Agente registrado exitosamente 🎉');
    } catch (err: any) {
      console.error('❌ Error registrando agente:', err);
      setStatus('error');
      setMessage(err.message || 'Error al registrar agente');
    }
  };

  const categories = ['Conversational', 'Analytics', 'Creative', 'Finance', 'Automation', 'Assistant'];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white overflow-hidden py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full border border-white/30 inline-flex items-center gap-2 mb-6">
            <Sparkles className="h-5 w-5" />
            <p className="text-white font-bold">Crear Nuevo Agente IA</p>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
            Registra tu Agente
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Comparte tu agente de IA con la comunidad y comienza a monetizar tus servicios en Avalanche
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Balance Info Card */}
          {isConnected && (
            <div className={`mb-6 rounded-2xl p-6 border-2 shadow-lg ${
              hasInsufficientFunds || (balanceData && balanceData.value < parseUnits('0.01', 18))
                ? 'bg-red-50 border-red-300'
                : 'bg-blue-50 border-blue-300'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${
                    hasInsufficientFunds || (balanceData && balanceData.value < parseUnits('0.01', 18))
                      ? 'bg-red-100'
                      : 'bg-blue-100'
                  }`}>
                    <Wallet className={`h-6 w-6 ${
                      hasInsufficientFunds || (balanceData && balanceData.value < parseUnits('0.01', 18))
                        ? 'text-red-600'
                        : 'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white-600">Tu Balance</p>
                    <p className={`text-2xl font-bold ${
                      hasInsufficientFunds || (balanceData && balanceData.value < parseUnits('0.01', 18))
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`}>
                      {isLoadingBalance ? (
                        <span className="animate-pulse">Cargando...</span>
                      ) : balanceData ? (
                        `${parseFloat(formatEther(balanceData.value)).toFixed(4)} AVAX`
                      ) : (
                        '0 AVAX'
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-600">Gas Estimado</p>
                  <p className="text-lg font-bold text-gray-900">~0.01 AVAX</p>
                </div>
              </div>
              
              {balanceData && balanceData.value < parseUnits('0.01', 18) && (
                <div className="mt-4 p-3 bg-red-100 rounded-lg border border-red-200">
                  <p className="text-sm font-bold text-red-800 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Balance insuficiente. Obtén AVAX del faucet de Avalanche Fuji antes de continuar.
                  </p>
                  <a
                    href="https://faucet.avax.network/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-all"
                  >
                    🚰 Ir al Faucet de AVAX
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-3xl shadow-2xl border-2 border-gray-200 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-8 py-6 border-b-2 border-gray-200">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl shadow-lg">
                  <Bot className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Información del Agente</h2>
                  <p className="text-gray-600 font-semibold">Completa todos los campos para registrar tu agente</p>
                </div>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Información Básica */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  Información Básica
                </h3>
                
                <div className="space-y-5">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      Nombre del Agente *
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Ej: Asistente Virtual Premium"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-gray-900 font-semibold placeholder:text-gray-500"
                      required
                    />
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Descripción *
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe las capacidades y funcionalidades de tu agente..."
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-gray-900 font-semibold placeholder:text-gray-500 resize-none"
                      required
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                      Categoría *
                    </label>
                    <select
                    title='Selecciona una categoría'
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-gray-900 font-bold cursor-pointer"
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="font-bold">{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Configuración Técnica */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  Configuración Técnica
                </h3>
                
                <div className="space-y-5">
                  {/* Endpoint */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-purple-600" />
                      Endpoint (URL del Agente) *
                    </label>
                    <input
                      type="url"
                      name="endpoint"
                      placeholder="https://tu-agente.com/api"
                      value={formData.endpoint}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-gray-900 font-semibold placeholder:text-gray-500"
                      required
                    />
                  </div>

                  {/* Documentación */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-purple-600" />
                      Enlace a Documentación (opcional)
                    </label>
                    <input
                      type="url"
                      name="documentation"
                      placeholder="https://docs.tu-agente.com"
                      value={formData.documentation}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-gray-900 font-semibold placeholder:text-gray-500"
                    />
                  </div>

                  {/* Versión */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <PackageCheck className="h-4 w-4 text-purple-600" />
                      Versión
                    </label>
                    <input
                      type="text"
                      name="version"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-gray-900 font-semibold placeholder:text-gray-500"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4 text-purple-600" />
                      Tags (separados por coma)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      placeholder="IA, Chatbot, Análisis, Machine Learning"
                      value={formData.tags}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border-2 border-gray-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-200 transition-all text-gray-900 font-semibold placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              {/* Precios */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  Configuración de Precios
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Precio por segundo */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      Precio por Segundo (AVAX) *
                    </label>
                    <input
                      type="number"
                      name="pricePerSecond"
                      placeholder="0.000001"
                      step="0.000001"
                      value={formData.pricePerSecond}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-green-300 focus:border-green-500 focus:ring-4 focus:ring-green-200 transition-all text-gray-900 font-bold placeholder:text-gray-500"
                      required
                    />
                    <p className="text-xs text-gray-600 mt-2 font-semibold">Costo por segundo de uso del agente</p>
                  </div>

                  {/* Tarifa base */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                      Tarifa Base (AVAX)
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      placeholder="0.00"
                      step="0.001"
                      value={formData.basePrice}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-gray-900 font-bold placeholder:text-gray-500"
                    />
                    <p className="text-xs text-gray-600 mt-2 font-semibold">Tarifa inicial fija (opcional)</p>
                  </div>
                </div>
              </div>

              {/* Botón Submit */}
              <div className="pt-6 border-t-2 border-gray-200">
                <button
                  type="submit"
                  disabled={
                    isPending || 
                    isConfirming || 
                    status === 'uploading' || 
                    status === 'registering' ||
                    !balanceData ||
                    balanceData.value < parseUnits('0.01', 18)
                  }
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 text-white px-6 py-5 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                >
                  {(isPending || isConfirming || status === 'uploading' || status === 'registering') ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span>
                        {status === 'uploading' && 'Subiendo a IPFS...'}
                        {status === 'registering' && 'Registrando en Blockchain...'}
                        {(isPending || isConfirming) && 'Procesando...'}
                      </span>
                    </>
                  ) : balanceData && balanceData.value < parseUnits('0.01', 18) ? (
                    <>
                      <AlertCircle className="h-6 w-6" />
                      <span>Balance Insuficiente para Registrar</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span>Registrar Agente en Blockchain</span>
                    </>
                  )}
                </button>
                
                {/* Mensaje adicional de fondos insuficientes */}
                {balanceData && balanceData.value < parseUnits('0.01', 18) && (
                  <p className="mt-3 text-center text-sm font-semibold text-red-600 flex items-center justify-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Necesitas al menos 0.01 AVAX para pagar el gas de la transacción
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Status Messages */}
          {message && (
            <div className={`mt-8 rounded-2xl p-6 border-2 shadow-lg ${
              status === 'error' 
                ? 'bg-red-50 border-red-300' 
                : status === 'success'
                ? 'bg-green-50 border-green-300'
                : 'bg-blue-50 border-blue-300'
            }`}>
              <div className="flex items-start gap-4">
                {status === 'error' && <AlertCircle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />}
                {status === 'success' && <CheckCircle className="h-8 w-8 text-green-600 flex-shrink-0 mt-1" />}
                {(status === 'uploading' || status === 'registering') && <Loader2 className="h-8 w-8 text-blue-600 animate-spin flex-shrink-0 mt-1" />}
                
                <div className="flex-1">
                  <h4 className={`text-lg font-bold mb-1 ${
                    status === 'error' ? 'text-red-900' : status === 'success' ? 'text-green-900' : 'text-blue-900'
                  }`}>
                    {status === 'error' && 'Error en el Registro'}
                    {status === 'success' && '¡Registro Exitoso!'}
                    {status === 'uploading' && 'Subiendo Información...'}
                    {status === 'registering' && 'Registrando Agente...'}
                  </h4>
                  <p className={`font-semibold ${
                    status === 'error' ? 'text-red-700' : status === 'success' ? 'text-green-700' : 'text-blue-700'
                  }`}>
                    {message}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}