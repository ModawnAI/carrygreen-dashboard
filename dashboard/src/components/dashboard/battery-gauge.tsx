"use client"

import { useBatteryData } from '@/context/realtime-data-context'
import { DashboardCard } from '@/components/layout/dashboard-layout'
import { Battery, Zap, Thermometer } from 'lucide-react'
import { useMemo } from 'react'

interface BatteryGaugeProps {
  className?: string
}

export function BatteryGauge({ className }: BatteryGaugeProps) {
  const batteryData = useBatteryData()

  const batteryMetrics = useMemo(() => {
    if (!batteryData) {
      return {
        soc: 85,
        voltage: 48.5,
        current: 0,
        temperature: 25,
        status: 'unknown' as const,
        color: 'text-gray-500'
      }
    }

    const soc = batteryData.Battery_SOC
    let status: 'charging' | 'discharging' | 'full' | 'low' | 'critical'
    let color: string

    if (soc >= 95) {
      status = 'full'
      color = 'text-green-500'
    } else if (soc >= 40) {
      status = batteryData.Battery_Current > 0 ? 'charging' : 'discharging'
      color = batteryData.Battery_Current > 0 ? 'text-blue-500' : 'text-yellow-500'
    } else if (soc >= 20) {
      status = 'low'
      color = 'text-orange-500'
    } else {
      status = 'critical'
      color = 'text-red-500'
    }

    return {
      soc: batteryData.Battery_SOC,
      voltage: batteryData.Battery_Voltage,
      current: batteryData.Battery_Current,
      temperature: batteryData.Battery_Temp,
      status,
      color
    }
  }, [batteryData])

  const gaugeStyles = useMemo(() => {
    const percentage = batteryMetrics.soc
    const strokeDasharray = 2 * Math.PI * 45 // circumference of circle with radius 45
    const strokeDashoffset = strokeDasharray - (strokeDasharray * percentage) / 100

    return {
      strokeDasharray,
      strokeDashoffset,
      transform: 'rotate(-90deg)',
      transformOrigin: '50% 50%'
    }
  }, [batteryMetrics.soc])

  const getStatusIcon = () => {
    switch (batteryMetrics.status) {
      case 'charging':
        return <Zap className="h-4 w-4 text-blue-500" />
      case 'full':
        return <Battery className="h-4 w-4 text-green-500" />
      case 'critical':
        return <Battery className="h-4 w-4 text-red-500" />
      default:
        return <Battery className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusText = () => {
    switch (batteryMetrics.status) {
      case 'charging':
        return 'Charging'
      case 'discharging':
        return 'Discharging'
      case 'full':
        return 'Full'
      case 'low':
        return 'Low'
      case 'critical':
        return 'Critical'
      default:
        return 'Unknown'
    }
  }

  return (
    <DashboardCard
      title="Battery Status"
      description="Real-time battery charge level and status"
      className={className}
    >
      <div className="flex flex-col items-center space-y-6">
        {/* Battery Gauge */}
        <div className="relative">
          <svg width="180" height="180" className="transform">
            {/* Background circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-gray-200 dark:text-gray-700"
            />

            {/* Progress circle */}
            <circle
              cx="90"
              cy="90"
              r="70"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={batteryMetrics.color}
              style={gaugeStyles}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className={`text-4xl font-bold ${batteryMetrics.color}`}>
              {batteryMetrics.soc.toFixed(1)}%
            </div>
            <div className="text-sm text-muted-foreground">
              State of Charge
            </div>
          </div>
        </div>

        {/* Status and Details */}
        <div className="w-full space-y-4">
          {/* Status */}
          <div className="flex items-center justify-center space-x-2">
            {getStatusIcon()}
            <span className={`font-medium ${batteryMetrics.color}`}>
              {getStatusText()}
            </span>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="font-semibold text-lg">
                {batteryMetrics.voltage.toFixed(1)}V
              </div>
              <div className="text-muted-foreground">Voltage</div>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className={`font-semibold text-lg ${
                batteryMetrics.current > 0 ? 'text-blue-500' : 'text-orange-500'
              }`}>
                {batteryMetrics.current > 0 ? '+' : ''}{batteryMetrics.current.toFixed(1)}A
              </div>
              <div className="text-muted-foreground">Current</div>
            </div>

            <div className="text-center p-3 bg-muted/50 rounded-lg col-span-2">
              <div className="flex items-center justify-center space-x-2">
                <Thermometer className="h-4 w-4" />
                <span className="font-semibold text-lg">
                  {batteryMetrics.temperature.toFixed(1)}°C
                </span>
              </div>
              <div className="text-muted-foreground">Temperature</div>
            </div>
          </div>

          {/* Power Flow Indicator */}
          {batteryMetrics.current !== 0 && (
            <div className="flex items-center justify-center space-x-2 text-sm">
              <div className={`flex items-center space-x-1 ${
                batteryMetrics.current > 0 ? 'text-blue-500' : 'text-orange-500'
              }`}>
                <span>
                  {batteryMetrics.current > 0 ? '↗' : '↙'}
                </span>
                <span>
                  {Math.abs(batteryMetrics.current * batteryMetrics.voltage).toFixed(0)}W
                </span>
                <span className="text-muted-foreground">
                  {batteryMetrics.current > 0 ? 'In' : 'Out'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardCard>
  )
}