'use client'

import { useState } from 'react'
import { Layout } from '@/components/Layout'
import { useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { useRegisterAgent } from '@/hooks/useAgentRegistry'

export default function AgentForm() {
  const { address, isConnected } = useAccount()
  const { registerAgent, isPending, isConfirming, isConfirmed, error } = useRegisterAgent()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    endpoint: '',
    category: '',
    documentation: '',
    version: '1.0.0',
    tags: '',
    pricePerHour: '',
  })

  const [status, setStatus] = useState<'idle' | 'uploading' | 'registering' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!isConnected) return alert('Por favor conecta tu wallet primero');
  if (!address) return alert('No se pudo obtener tu dirección de wallet');

  try {
    setStatus('uploading');
    setMessage('Subiendo metadata a IPFS...');

    // 🔹 1. Subir metadata a tu gateway
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

    const text = await response.text(); // <- obtenemos el texto primero
    console.log('📥 Respuesta del servidor (raw):', text);

    // Intentar parsear JSON y detectar HTML o errores
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

    // 🔹 2. Registrar agente en blockchain
    setStatus('registering');
    setMessage('Registrando agente en blockchain...');

    // Convierte el precio por hora a precio por segundo
    const pricePerSecond = parseUnits(
      (parseFloat(formData.pricePerHour) / 3600).toFixed(18),
      18
    )

    console.log('💰 pricePerSecond:', pricePerSecond.toString());

    await registerAgent(ipfsHash, pricePerSecond.toString());

    setStatus('success');
    setMessage('Agente registrado exitosamente 🎉');
  } catch (err: any) {
    console.error('❌ Error registrando agente:', err);
    setStatus('error');
    setMessage(err.message || 'Error al registrar agente');
  }
};


  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-6 bg-gray-900 text-white rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Registrar nuevo Agente</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Nombre del agente"
            value={formData.name} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" required />

          <textarea name="description" placeholder="Descripción"
            value={formData.description} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" required />

          <input type="text" name="endpoint" placeholder="Endpoint (URL del agente)"
            value={formData.endpoint} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" required />

          <input type="text" name="category" placeholder="Categoría"
            value={formData.category} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" required />

          <input type="text" name="documentation" placeholder="Enlace a documentación (opcional)"
            value={formData.documentation} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" />

          <input type="text" name="version" placeholder="Versión"
            value={formData.version} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" />

          <input type="text" name="tags" placeholder="Tags (separados por coma)"
            value={formData.tags} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" />

          <input type="number" name="pricePerHour" placeholder="Precio por hora (en AVAX)"
            value={formData.pricePerHour} onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 border border-gray-700" required />

          <button
            type="submit"
            disabled={isPending || isConfirming}
            className="w-full bg-purple-600 hover:bg-purple-700 transition p-2 rounded font-semibold"
          >
            {isPending || isConfirming ? 'Registrando...' : 'Registrar Agente'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 text-center ${status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
            {message}
          </div>
        )}
      </div>
    </Layout>
  )
}
