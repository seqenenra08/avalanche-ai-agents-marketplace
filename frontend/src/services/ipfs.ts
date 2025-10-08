export async function fetchAgentMetadata(cid: string) {
  try {
    const res = await fetch(`https://ipfs.io/ipfs/${cid}`)
    if (!res.ok) throw new Error('Failed to fetch IPFS metadata')
    return await res.json()
  } catch (err) {
    console.error('Error fetching metadata:', err)
    return {
      name: 'Unknown',
      description: '',
      category: 'Unknown',
      tags: [],
      image: ''
    }
  }
}
