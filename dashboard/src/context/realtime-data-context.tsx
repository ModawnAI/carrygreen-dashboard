"use client"

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { InverterRecord } from '@/types/inverter-data'
import { WebSocketService, getWebSocketService } from '@/services/websocket-service'

interface RealtimeDataContextType {
  // Current data
  currentData: InverterRecord | null
  historicalData: InverterRecord[]

  // Connection status
  isConnected: boolean
  isConnecting: boolean
  connectionError: string | null
  lastUpdate: Date | null
  retryCount: number

  // Controls
  connect: () => Promise<void>
  disconnect: () => void
  reconnect: () => Promise<void>
  updateInterval: (interval: number) => void

  // Data methods
  getHistoricalData: (hoursBack?: number) => InverterRecord[]
  clearData: () => void
}

const RealtimeDataContext = createContext<RealtimeDataContextType | undefined>(undefined)

interface RealtimeDataProviderProps {
  children: ReactNode
  autoConnect?: boolean
  updateInterval?: number
}

export function RealtimeDataProvider({
  children,
  autoConnect = true,
  updateInterval = 5000
}: RealtimeDataProviderProps) {
  const [webSocketService] = useState<WebSocketService>(() =>
    getWebSocketService({ updateInterval })
  )

  const [currentData, setCurrentData] = useState<InverterRecord | null>(null)
  const [historicalData, setHistoricalData] = useState<InverterRecord[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    // Setup event listeners
    const handleData = (data: InverterRecord) => {
      setCurrentData(data)
      setHistoricalData(prev => {
        const newData = [...prev, data]
        // Keep only last 100 records for performance
        return newData.slice(-100)
      })
      setLastUpdate(new Date())
    }

    const handleConnectionStateChange = (status: any) => {
      setIsConnected(status.connected)
      setConnectionError(status.error)
      setLastUpdate(status.lastUpdate)
      setRetryCount(status.retryCount)
      setIsConnecting(false)
    }

    const handleConnected = () => {
      setIsConnected(true)
      setIsConnecting(false)
      setConnectionError(null)
      console.log('Real-time data connected')
    }

    const handleDisconnected = () => {
      setIsConnected(false)
      setIsConnecting(false)
      console.log('Real-time data disconnected')
    }

    const handleReconnecting = (data: { attempt: number }) => {
      setIsConnecting(true)
      setRetryCount(data.attempt)
      console.log(`Reconnecting attempt ${data.attempt}`)
    }

    const handleError = (error: Error) => {
      setConnectionError(error.message)
      setIsConnecting(false)
      console.error('Real-time data error:', error)
    }

    const handleMaxRetriesReached = () => {
      setIsConnecting(false)
      setConnectionError('Maximum connection attempts reached')
      console.error('Max retry attempts reached')
    }

    // Register event listeners
    webSocketService.on('data', handleData)
    webSocketService.on('connectionStateChange', handleConnectionStateChange)
    webSocketService.on('connected', handleConnected)
    webSocketService.on('disconnected', handleDisconnected)
    webSocketService.on('reconnecting', handleReconnecting)
    webSocketService.on('error', handleError)
    webSocketService.on('maxRetriesReached', handleMaxRetriesReached)

    // Auto-connect if enabled
    if (autoConnect) {
      setIsConnecting(true)
      webSocketService.connect().catch(error => {
        console.error('Auto-connect failed:', error)
        setIsConnecting(false)
      })
    }

    // Load initial historical data
    const initialHistoricalData = webSocketService.getHistoricalData(1) // Last 1 hour
    setHistoricalData(initialHistoricalData)

    // Cleanup function
    return () => {
      webSocketService.off('data', handleData)
      webSocketService.off('connectionStateChange', handleConnectionStateChange)
      webSocketService.off('connected', handleConnected)
      webSocketService.off('disconnected', handleDisconnected)
      webSocketService.off('reconnecting', handleReconnecting)
      webSocketService.off('error', handleError)
      webSocketService.off('maxRetriesReached', handleMaxRetriesReached)
    }
  }, [webSocketService, autoConnect])

  const connect = async (): Promise<void> => {
    if (isConnected || isConnecting) {
      return
    }

    setIsConnecting(true)
    setConnectionError(null)

    try {
      await webSocketService.connect()
    } catch (error) {
      setIsConnecting(false)
      throw error
    }
  }

  const disconnect = (): void => {
    webSocketService.disconnect()
  }

  const reconnect = async (): Promise<void> => {
    disconnect()
    // Small delay before reconnecting
    setTimeout(() => {
      connect()
    }, 1000)
  }

  const updateUpdateInterval = (interval: number): void => {
    webSocketService.updateConfig({ updateInterval: interval })
  }

  const getHistoricalDataMethod = (hoursBack: number = 24): InverterRecord[] => {
    return webSocketService.getHistoricalData(hoursBack)
  }

  const clearData = (): void => {
    setCurrentData(null)
    setHistoricalData([])
    webSocketService.clearCache()
  }

  const contextValue: RealtimeDataContextType = {
    // Data
    currentData,
    historicalData,

    // Status
    isConnected,
    isConnecting,
    connectionError,
    lastUpdate,
    retryCount,

    // Controls
    connect,
    disconnect,
    reconnect,
    updateInterval: updateUpdateInterval,

    // Methods
    getHistoricalData: getHistoricalDataMethod,
    clearData
  }

  return (
    <RealtimeDataContext.Provider value={contextValue}>
      {children}
    </RealtimeDataContext.Provider>
  )
}

export function useRealtimeData(): RealtimeDataContextType {
  const context = useContext(RealtimeDataContext)
  if (context === undefined) {
    throw new Error('useRealtimeData must be used within a RealtimeDataProvider')
  }
  return context
}

// Custom hooks for specific data
export function useCurrentData(): InverterRecord | null {
  const { currentData } = useRealtimeData()
  return currentData
}

export function useConnectionStatus() {
  const { isConnected, isConnecting, connectionError, lastUpdate, retryCount } = useRealtimeData()
  return { isConnected, isConnecting, connectionError, lastUpdate, retryCount }
}

export function usePVData() {
  const { currentData } = useRealtimeData()
  return currentData?.pv || null
}

export function useBatteryData() {
  const { currentData } = useRealtimeData()
  return currentData?.battery || null
}

export function useGridData() {
  const { currentData } = useRealtimeData()
  return currentData?.grid || null
}

export function useSystemStatus() {
  const { currentData } = useRealtimeData()
  return currentData?.system || null
}