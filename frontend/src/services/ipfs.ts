// Tipos para IPFS
export interface AgentMetadata {
  name: string
  description: string
  category: string
  tags: string[]
  metadata: {
    version: string
    author: string
    requirements: string[]
    capabilities: string[]
  }
  image?: string | null
  createdAt: string
  owner: string
}

export interface IPFSUploadResult {
  cid: string
  url: string
}

// Configuración de IPFS
const IPFS_GATEWAY = process.env.NEXT_PUBLIC_IPFS_GATEWAY || 'https://ipfs.io/ipfs/'

class IPFSService {
  
  async uploadJSON(data: AgentMetadata): Promise<IPFSUploadResult> {
    try {
      // Usar la API route para subir a IPFS
      const response = await fetch('/api/ipfs/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      return {
        cid: result.cid,
        url: result.url
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error)
      throw new Error('Failed to upload metadata to IPFS')
    }
  }

  async uploadImage(file: File): Promise<IPFSUploadResult> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ipfs/upload', {
        method: 'PUT',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Image upload failed')
      }

      const result = await response.json()
      return {
        cid: result.cid,
        url: result.url
      }
    } catch (error) {
      console.error('Error uploading image to IPFS:', error)
      throw new Error('Failed to upload image to IPFS')
    }
  }

  async retrieveMetadata(cid: string): Promise<AgentMetadata> {
    try {
      const response = await fetch(`${IPFS_GATEWAY}${cid}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error retrieving metadata from IPFS:', error)
      throw new Error('Failed to retrieve metadata from IPFS')
    }
  }

  // Generar metadata URI para el contrato
  getMetadataURI(cid: string): string {
    return `ipfs://${cid}`
  }

  // Resolver URI IPFS a URL HTTP
  resolveIPFSURI(uri: string): string {
    if (uri.startsWith('ipfs://')) {
      const cid = uri.replace('ipfs://', '')
      return `${IPFS_GATEWAY}${cid}`
    }
    return uri
  }
}

// Exportar instancia singleton
export const ipfsService = new IPFSService()
export default IPFSService