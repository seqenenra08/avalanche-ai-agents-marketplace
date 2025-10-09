import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseEther, formatEther, type Address } from 'viem'
import { AGENT_REGISTRY_ABI } from '@/contracts/AgentRegistry'

// Dirección del contrato (actualizar cuando se despliegue)
const AGENT_REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS as Address || '0x0000000000000000000000000000000000000000'

// Tipos
export interface Agent {
  id: bigint
  owner: Address
  ipfsHash: string
  score: bigint
  pricePerSecond: bigint
  basePrice: bigint
  available: boolean
  createdAt: bigint
}

export interface Rental {
  renter: Address
  startAt: bigint
  endAt: bigint
  pricePaid: bigint
}

// Hook para leer un agente por ID
export function useAgent(id: number) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getAgent',
    args: [BigInt(id)],
    query: {
      enabled: id > 0
    }
  })
}

// Hook para verificar si un agente está rentado
export function useIsAgentRented(id: number) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'isRented',
    args: [BigInt(id)],
    query: {
      enabled: id > 0,
      refetchInterval: 3000, // Actualizar cada 3 segundos
    }
  })
}

// Hook para traer todos los agentes registrados
export function useAllAgents() {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getAgents',
    query: {
      refetchInterval: 3000, // actualiza cada 3 segundos
    },
  })
}

// Hook para obtener información de renta
export function useAgentRental(id: number) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'getRental',
    args: [BigInt(id)],
    query: {
      enabled: id > 0
    }
  })
}

// Hook para obtener tiempo restante de renta
export function useRentalTimeRemaining(id: number) {
  return useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'rentalTimeRemaining',
    args: [BigInt(id)],
    query: {
      enabled: id > 0,
      refetchInterval: 30000 // Actualizar cada 30 segundos
    }
  })
}

// Hook para obtener balance de ganancias
export function useOwnerBalance(address: Address) {
  const result = useReadContract({
    address: AGENT_REGISTRY_ADDRESS,
    abi: AGENT_REGISTRY_ABI,
    functionName: 'balances',
    args: [address],
    query: {
      enabled: !!address
    }
  })
  
  console.log('useOwnerBalance:', { address, balance: result.data, isLoading: result.isLoading, error: result.error })
  
  return result
}

// Hook para registrar un agente
export function useRegisterAgent() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const registerAgent = async (ipfsHash: string, priceInAvaxPerSecond: string, basePrice: string) => {
    const pricePerSecond = parseEther(priceInAvaxPerSecond)
    const basePriceBigInt = BigInt(Math.floor(parseFloat(basePrice) * 1e18))


    console.log('🚀 Registrando agente con:', { ipfsHash, pricePerSecond: pricePerSecond.toString(), basePricePerSecond: basePriceBigInt.toString() })
    
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'registerAgent',
      args: [ipfsHash, pricePerSecond, basePriceBigInt],
    })
  }

  return {
    registerAgent,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed
  }
}

// Hook para rentar un agente
export function useRentAgent() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const rentAgent = async (id: number, durationSeconds: number, pricePerSecond: bigint, basePrice: bigint) => {
    const totalCost = pricePerSecond * BigInt(durationSeconds) + basePrice
    
    // Verificar si el precio es razonable (menos de 100 AVAX)
    const maxReasonablePrice = parseEther('100') // 100 AVAX máximo
    if (totalCost > maxReasonablePrice) {
      console.error('❌ Precio demasiado alto:', {
        totalCostETH: formatEther(totalCost),
        pricePerSecondETH: formatEther(pricePerSecond),
        basePriceETH: formatEther(basePrice),
        durationSeconds
      })
      alert(`El precio calculado (${formatEther(totalCost)} AVAX) parece demasiado alto. Verifica la configuración de precios del agente.`)
      return
    }
    
    console.log('🚀 Rentando agente con:', { 
      id, 
      durationSeconds, 
      pricePerSecond: pricePerSecond.toString(), 
      basePrice: basePrice.toString(), 
      totalCost: totalCost.toString(),
      totalCostETH: formatEther(totalCost)
    })
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'rentAgent',
      args: [BigInt(id), BigInt(durationSeconds)],
      value: totalCost,
    })
  }

  return {
    rentAgent,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed
  }
}

// Hook para extender renta
export function useExtendRental() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const extendRental = async (id: number, extraSeconds: number, pricePerSecond: bigint) => {
    const extraCost = pricePerSecond * BigInt(extraSeconds)
    
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'extendRental',
      args: [BigInt(id), BigInt(extraSeconds)],
      value: extraCost,
    })
  }

  return {
    extendRental,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed
  }
}

// Hook para cambiar precio de agente
export function useSetAgentPrice() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setPrice = async (id: number, newPriceInAvaxPerSecond: string) => {
    const newPricePerSecond = parseEther(newPriceInAvaxPerSecond)
    
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'setPrice',
      args: [BigInt(id), newPricePerSecond],
    })
  }

  return {
    setPrice,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed
  }
}

export function useSetAgentBasePrice() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const setBasePrice = async (id: number, newBasePriceInAvax: string) => {
    const newBasePrice = parseEther(newBasePriceInAvax)
    
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'setBasePrice',
      args: [BigInt(id), newBasePrice],
    })
  }

  return {
    setBasePrice,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed
  }
}

// Hook para cambiar la disponibilidad del agente
export function useSetAgentAvailability() {
  const { writeContractAsync, data: hash, error, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  const setAvailability = async (id: number, available: boolean) => {
    if (!id || id <= 0) throw new Error("ID inválido del agente");

    try {
      // Ejecuta la transacción y espera confirmación
      const txHash = await writeContractAsync({
        address: AGENT_REGISTRY_ADDRESS,
        abi: AGENT_REGISTRY_ABI,
        functionName: "setAvailability",
        args: [BigInt(id), available],
      });

      console.log("✅ Transacción enviada:", txHash);
      return txHash;
    } catch (err) {
      console.error("❌ Error al cambiar disponibilidad:", err);
      throw err;
    }
  };

  return {
    setAvailability,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed,
  };
}


// Hook para retirar ganancias
export function useWithdrawEarnings() {
  const { writeContract, data: hash, error, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  const withdrawEarnings = async () => {
    writeContract({
      address: AGENT_REGISTRY_ADDRESS,
      abi: AGENT_REGISTRY_ABI,
      functionName: 'withdrawEarnings',
    })
  }

  return {
    withdrawEarnings,
    hash,
    error,
    isPending,
    isConfirming,
    isConfirmed
  }
}

// Utilidades
export function formatPricePerSecond(pricePerSecond: bigint): string {
  return formatEther(pricePerSecond)
}

export function calculateRentalCost(pricePerSecond: bigint, durationSeconds: number): bigint {
  return pricePerSecond * BigInt(durationSeconds)
}

export function formatRentalCost(pricePerSecond: bigint, durationSeconds: number): string {
  const cost = calculateRentalCost(pricePerSecond, durationSeconds)
  return formatEther(cost)
}