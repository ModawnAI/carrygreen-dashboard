import { InverterRecord, PVData, BatteryData, InverterData, GridData, SystemStatus } from '@/types/inverter-data'

interface GeneratorConfig {
  baseValues: {
    pvVoltage: number
    pvCurrent: number
    batteryVoltage: number
    batterySoc: number
    gridVoltage: number
    gridFrequency: number
  }
  variationRanges: {
    pvPower: { min: number; max: number }
    batteryTemp: { min: number; max: number }
    gridCurrent: { min: number; max: number }
  }
  timeOfDay: 'morning' | 'noon' | 'afternoon' | 'evening' | 'night'
}

export class DataGenerator {
  private config: GeneratorConfig
  private lastRecord: InverterRecord | null = null
  private dailyEnergy = 0
  private monthlyEnergy = 0
  private yearlyEnergy = 0

  constructor() {
    this.config = this.getDefaultConfig()
    this.updateTimeBasedConfig()
  }

  private getDefaultConfig(): GeneratorConfig {
    return {
      baseValues: {
        pvVoltage: 48.0,
        pvCurrent: 25.0,
        batteryVoltage: 48.5,
        batterySoc: 85,
        gridVoltage: 230,
        gridFrequency: 50.0
      },
      variationRanges: {
        pvPower: { min: 0, max: 3000 },
        batteryTemp: { min: 20, max: 35 },
        gridCurrent: { min: 5, max: 15 }
      },
      timeOfDay: this.getCurrentTimeOfDay()
    }
  }

  private getCurrentTimeOfDay(): 'morning' | 'noon' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 9) return 'morning'
    if (hour >= 9 && hour < 12) return 'noon'
    if (hour >= 12 && hour < 17) return 'afternoon'
    if (hour >= 17 && hour < 20) return 'evening'
    return 'night'
  }

  private updateTimeBasedConfig(): void {
    const timeOfDay = this.getCurrentTimeOfDay()
    this.config.timeOfDay = timeOfDay

    // Adjust power generation based on time of day
    switch (timeOfDay) {
      case 'morning':
        this.config.variationRanges.pvPower = { min: 500, max: 1500 }
        break
      case 'noon':
        this.config.variationRanges.pvPower = { min: 2000, max: 3000 }
        break
      case 'afternoon':
        this.config.variationRanges.pvPower = { min: 1500, max: 2500 }
        break
      case 'evening':
        this.config.variationRanges.pvPower = { min: 200, max: 800 }
        break
      case 'night':
        this.config.variationRanges.pvPower = { min: 0, max: 50 }
        break
    }
  }

  private generatePVData(): PVData {
    const { baseValues, variationRanges, timeOfDay } = this.config

    // Generate realistic voltage with small variations
    const voltage = this.addVariation(baseValues.pvVoltage, 0.05)

    // Generate power based on time of day
    const power = this.randomInRange(
      variationRanges.pvPower.min,
      variationRanges.pvPower.max
    )

    // Calculate current from power and voltage (P = V * I)
    const current = power > 0 ? Number((power / voltage).toFixed(2)) : 0

    // Add some cloud simulation (occasional power drops)
    const cloudFactor = Math.random() < 0.1 ? 0.3 : 1 // 10% chance of clouds
    const adjustedPower = Number((power * cloudFactor).toFixed(1))
    const adjustedCurrent = adjustedPower > 0 ? Number((adjustedPower / voltage).toFixed(2)) : 0

    // Update daily energy (accumulate over time)
    const energyIncrement = (adjustedPower / 1000) * (1 / 60) // Convert to kWh per minute
    this.dailyEnergy += energyIncrement
    this.monthlyEnergy += energyIncrement
    this.yearlyEnergy += energyIncrement

    return {
      PV_Voltage: Number(voltage.toFixed(1)),
      PV_Current: adjustedCurrent,
      PV_Power_W: adjustedPower,
      PV_Daily_Wh: Number((this.dailyEnergy * 1000).toFixed(0)),
      PV_Monthly_Wh: Number((this.monthlyEnergy * 1000).toFixed(0)),
      PV_Yearly_Wh: Number((this.yearlyEnergy * 1000).toFixed(0))
    }
  }

  private generateBatteryData(): BatteryData {
    const { baseValues, variationRanges } = this.config

    // Generate battery data with realistic charging/discharging patterns
    const voltage = this.addVariation(baseValues.batteryVoltage, 0.02)

    // Battery current depends on solar generation and grid usage
    let current = this.randomInRange(-10, 20) // Negative = discharging, Positive = charging

    // Adjust SOC gradually
    let newSoc = baseValues.batterySoc
    if (this.lastRecord) {
      const socChange = current > 0 ? 0.1 : -0.05 // Slow SOC changes
      newSoc = Math.max(0, Math.min(100, baseValues.batterySoc + socChange))
      this.config.baseValues.batterySoc = newSoc
    }

    const temperature = this.randomInRange(
      variationRanges.batteryTemp.min,
      variationRanges.batteryTemp.max
    )

    return {
      Battery_Voltage: Number(voltage.toFixed(1)),
      Battery_Current: Number(current.toFixed(1)),
      Battery_Temp: Number(temperature.toFixed(1)),
      Battery_SOC: Number(newSoc.toFixed(1))
    }
  }

  private generateInverterData(): InverterData {
    const { baseValues } = this.config

    // Inverter data is typically stable with minor variations
    const voltage = this.addVariation(baseValues.gridVoltage, 0.01)
    const current = this.randomInRange(2, 12)
    const frequency = this.addVariation(baseValues.gridFrequency, 0.001)

    return {
      Inverter_Voltage: Number(voltage.toFixed(1)),
      Inverter_Current: Number(current.toFixed(1)),
      Inverter_Frequency: Number(frequency.toFixed(2))
    }
  }

  private generateGridData(): GridData {
    const { baseValues, variationRanges } = this.config

    // Grid data should be stable
    const voltage = this.addVariation(baseValues.gridVoltage, 0.005)
    const current = this.randomInRange(
      variationRanges.gridCurrent.min,
      variationRanges.gridCurrent.max
    )
    const frequency = this.addVariation(baseValues.gridFrequency, 0.0005)

    return {
      Grid_Voltage: Number(voltage.toFixed(1)),
      Grid_Current: Number(current.toFixed(1)),
      Grid_Frequency: Number(frequency.toFixed(2))
    }
  }

  private generateSystemStatus(): SystemStatus {
    // System status with occasional alerts
    const alertProbability = 0.02 // 2% chance of alert
    const hasAlert = Math.random() < alertProbability

    return {
      status: hasAlert ? 'warning' : 'normal',
      alerts: hasAlert ? ['Low battery warning'] : [],
      lastUpdate: new Date(),
      connectionStatus: 'connected',
      dataQuality: 'good'
    }
  }

  public generateRealtimeData(): InverterRecord {
    this.updateTimeBasedConfig()

    const timestamp = new Date()

    const pvData = this.generatePVData()
    const batteryData = this.generateBatteryData()
    const inverterData = this.generateInverterData()
    const gridData = this.generateGridData()
    const systemStatus = this.generateSystemStatus()

    const record: InverterRecord = {
      timestamp,
      pv: pvData,
      battery: batteryData,
      inverter: inverterData,
      grid: gridData,
      system: systemStatus
    }

    this.lastRecord = record
    return record
  }

  private addVariation(baseValue: number, variationPercent: number): number {
    const variation = baseValue * variationPercent * (Math.random() - 0.5)
    return baseValue + variation
  }

  private randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min
  }

  // Simulate historical data for charts
  public generateHistoricalData(hoursBack: number = 24, intervalMinutes: number = 5): InverterRecord[] {
    const records: InverterRecord[] = []
    const totalPoints = (hoursBack * 60) / intervalMinutes

    for (let i = totalPoints; i >= 0; i--) {
      const timestamp = new Date(Date.now() - (i * intervalMinutes * 60 * 1000))

      // Temporarily adjust config for historical time
      const currentHour = timestamp.getHours()
      const oldTimeOfDay = this.config.timeOfDay

      if (currentHour >= 6 && currentHour < 9) this.config.timeOfDay = 'morning'
      else if (currentHour >= 9 && currentHour < 12) this.config.timeOfDay = 'noon'
      else if (currentHour >= 12 && currentHour < 17) this.config.timeOfDay = 'afternoon'
      else if (currentHour >= 17 && currentHour < 20) this.config.timeOfDay = 'evening'
      else this.config.timeOfDay = 'night'

      this.updateTimeBasedConfig()

      const record = this.generateRealtimeData()
      record.timestamp = timestamp
      records.push(record)

      // Restore original time config
      this.config.timeOfDay = oldTimeOfDay
      this.updateTimeBasedConfig()
    }

    return records
  }

  // Reset daily counters (call at midnight)
  public resetDailyCounters(): void {
    this.dailyEnergy = 0
  }

  // Reset monthly counters (call at month start)
  public resetMonthlyCounters(): void {
    this.monthlyEnergy = 0
  }

  // Reset yearly counters (call at year start)
  public resetYearlyCounters(): void {
    this.yearlyEnergy = 0
  }
}