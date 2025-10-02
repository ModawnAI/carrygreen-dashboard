import { InverterRecord } from '@/types/inverter-data'
import { DataGenerator } from './data-generator'

interface WebSocketConfig {
  updateInterval: number // milliseconds
  maxRetries: number
  reconnectDelay: number // milliseconds
  heartbeatInterval: number // milliseconds
}

interface ConnectionStatus {
  connected: boolean
  lastUpdate: Date | null
  retryCount: number
  error: string | null
}

type EventCallback<T = any> = (data: T) => void

export class WebSocketService {
  private dataGenerator: DataGenerator
  private config: WebSocketConfig
  private status: ConnectionStatus
  private updateTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private eventListeners: Map<string, EventCallback[]> = new Map()
  private dataCache: InverterRecord[] = []
  private maxCacheSize = 1000 // Keep last 1000 records

  constructor(config?: Partial<WebSocketConfig>) {
    this.dataGenerator = new DataGenerator()
    this.config = {
      updateInterval: 5000, // 5 seconds
      maxRetries: 5,
      reconnectDelay: 2000,
      heartbeatInterval: 30000, // 30 seconds
      ...config
    }
    this.status = {
      connected: false,
      lastUpdate: null,
      retryCount: 0,
      error: null
    }
  }

  // Event emitter methods
  public on(event: string, callback: EventCallback): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  public off(event: string, callback: EventCallback): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event)
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error)
        }
      })
    }
  }

  // Connection management
  public async connect(): Promise<void> {
    if (this.status.connected) {
      console.warn('WebSocket service already connected')
      return
    }

    try {
      this.status.connected = true
      this.status.retryCount = 0
      this.status.error = null
      this.status.lastUpdate = new Date()

      this.emit('connectionStateChange', this.status)
      this.emit('connected')

      // Start data updates
      this.startDataUpdates()
      this.startHeartbeat()

      console.log('WebSocket service connected successfully')
    } catch (error) {
      this.handleConnectionError(error as Error)
    }
  }

  public disconnect(): void {
    if (!this.status.connected) {
      return
    }

    this.status.connected = false
    this.stopDataUpdates()
    this.stopHeartbeat()

    this.emit('connectionStateChange', this.status)
    this.emit('disconnected')

    console.log('WebSocket service disconnected')
  }

  private async reconnect(): Promise<void> {
    if (this.status.retryCount >= this.config.maxRetries) {
      this.status.error = 'Max reconnection attempts reached'
      this.emit('connectionStateChange', this.status)
      this.emit('maxRetriesReached')
      return
    }

    this.status.retryCount++
    this.emit('reconnecting', { attempt: this.status.retryCount })

    setTimeout(async () => {
      try {
        await this.connect()
      } catch (error) {
        this.handleConnectionError(error as Error)
      }
    }, this.config.reconnectDelay * this.status.retryCount) // Exponential backoff
  }

  private handleConnectionError(error: Error): void {
    console.error('WebSocket connection error:', error)
    this.status.connected = false
    this.status.error = error.message

    this.stopDataUpdates()
    this.stopHeartbeat()

    this.emit('connectionStateChange', this.status)
    this.emit('error', error)

    // Attempt to reconnect
    if (this.status.retryCount < this.config.maxRetries) {
      this.reconnect()
    }
  }

  // Data update management
  private startDataUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
    }

    this.updateTimer = setInterval(() => {
      this.generateAndEmitData()
    }, this.config.updateInterval)

    // Generate initial data
    this.generateAndEmitData()
  }

  private stopDataUpdates(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = null
    }
  }

  private generateAndEmitData(): void {
    try {
      const newData = this.dataGenerator.generateRealtimeData()

      // Update cache
      this.addToCache(newData)

      // Update status
      this.status.lastUpdate = new Date()

      // Emit data to listeners
      this.emit('data', newData)
      this.emit('connectionStateChange', this.status)

    } catch (error) {
      console.error('Error generating data:', error)
      this.handleConnectionError(error as Error)
    }
  }

  // Heartbeat management
  private startHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }

    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private sendHeartbeat(): void {
    if (this.status.connected) {
      this.emit('heartbeat', { timestamp: new Date() })
    }
  }

  // Data cache management
  private addToCache(record: InverterRecord): void {
    this.dataCache.push(record)

    // Maintain cache size
    if (this.dataCache.length > this.maxCacheSize) {
      this.dataCache.shift()
    }
  }

  public getCachedData(limit?: number): InverterRecord[] {
    if (limit) {
      return this.dataCache.slice(-limit)
    }
    return [...this.dataCache]
  }

  public getHistoricalData(hoursBack: number = 24): InverterRecord[] {
    return this.dataGenerator.generateHistoricalData(hoursBack)
  }

  // Configuration management
  public updateConfig(newConfig: Partial<WebSocketConfig>): void {
    const oldInterval = this.config.updateInterval

    this.config = { ...this.config, ...newConfig }

    // Restart updates if interval changed and service is connected
    if (newConfig.updateInterval && newConfig.updateInterval !== oldInterval && this.status.connected) {
      this.startDataUpdates()
    }

    this.emit('configUpdated', this.config)
  }

  public getConfig(): WebSocketConfig {
    return { ...this.config }
  }

  // Status methods
  public getStatus(): ConnectionStatus {
    return { ...this.status }
  }

  public isConnected(): boolean {
    return this.status.connected
  }

  public getLastUpdate(): Date | null {
    return this.status.lastUpdate
  }

  // Utility methods
  public clearCache(): void {
    this.dataCache = []
    this.emit('cacheCleared')
  }

  public getLatestData(): InverterRecord | null {
    return this.dataCache.length > 0 ? this.dataCache[this.dataCache.length - 1] : null
  }

  // Cleanup
  public destroy(): void {
    this.disconnect()
    this.eventListeners.clear()
    this.dataCache = []
  }

  // Static factory method
  public static create(config?: Partial<WebSocketConfig>): WebSocketService {
    return new WebSocketService(config)
  }
}

// Singleton instance for global use
let instance: WebSocketService | null = null

export const getWebSocketService = (config?: Partial<WebSocketConfig>): WebSocketService => {
  if (!instance) {
    instance = new WebSocketService(config)
  }
  return instance
}

// Export default instance
export default getWebSocketService()