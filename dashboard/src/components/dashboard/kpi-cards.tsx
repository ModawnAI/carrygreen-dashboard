"use client"

import { useCurrentData, useConnectionStatus } from '@/context/realtime-data-context'
import { DashboardCard } from '@/components/layout/dashboard-layout'
import { Battery, Zap, Grid3X3, TrendingUp, Wifi, WifiOff } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useMemo } from 'react'

export function KPICards() {
  const currentData = useCurrentData()
  const { isConnected, lastUpdate } = useConnectionStatus()

  const kpiData = useMemo(() => {
    if (!currentData) {
      return {
        solarPower: { value: 0, unit: 'kW', trend: 0 },
        batterySOC: { value: 85, unit: '%', trend: 0 },
        gridVoltage: { value: 230, unit: 'V', trend: 0 },
        dailyEnergy: { value: 0, unit: 'kWh', trend: 0 }
      }
    }

    const { pv, battery, grid } = currentData

    return {
      solarPower: {
        value: (pv.PV_Power_W / 1000),
        unit: 'kW',
        trend: 0 // TODO: Calculate trend from historical data
      },
      batterySOC: {
        value: battery.Battery_SOC,
        unit: '%',
        trend: 0 // TODO: Calculate trend
      },
      gridVoltage: {
        value: grid.Grid_Voltage,
        unit: 'V',
        trend: 0 // TODO: Calculate trend
      },
      dailyEnergy: {
        value: (pv.PV_Daily_Wh / 1000),
        unit: 'kWh',
        trend: 0 // TODO: Calculate trend
      }
    }
  }, [currentData])

  const formatValue = (value: number, decimals: number = 1): string => {
    return value.toFixed(decimals)
  }

  const getStatusColor = (type: 'solar' | 'battery' | 'grid' | 'energy') => {
    if (!isConnected) return 'border-gray-300 dark:border-gray-600'

    switch (type) {
      case 'solar':
        return kpiData.solarPower.value > 0
          ? 'border-yellow-200 dark:border-yellow-800'
          : 'border-gray-200 dark:border-gray-700'
      case 'battery':
        if (kpiData.batterySOC.value >= 80) return 'border-green-200 dark:border-green-800'
        if (kpiData.batterySOC.value >= 40) return 'border-blue-200 dark:border-blue-800'
        if (kpiData.batterySOC.value >= 20) return 'border-orange-200 dark:border-orange-800'
        return 'border-red-200 dark:border-red-800'
      case 'grid':
        return Math.abs(kpiData.gridVoltage.value - 230) < 10
          ? 'border-green-200 dark:border-green-800'
          : 'border-orange-200 dark:border-orange-800'
      case 'energy':
        return 'border-green-200 dark:border-green-800'
      default:
        return 'border-gray-200 dark:border-gray-700'
    }
  }

  const ConnectionIndicator = () => (
    <div className="flex items-center space-x-1 text-xs">
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3 text-green-500" />
          <span className="text-green-600">Live</span>
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 text-red-500" />
          <span className="text-red-600">Offline</span>
        </>
      )}
    </div>
  )

  const LastUpdate = () => {
    if (!lastUpdate) return null

    const timeDiff = Date.now() - lastUpdate.getTime()
    const seconds = Math.floor(timeDiff / 1000)

    if (seconds < 60) {
      return (
        <div className="text-xs text-muted-foreground">
          {seconds}s ago
        </div>
      )
    }

    const minutes = Math.floor(seconds / 60)
    return (
      <div className="text-xs text-muted-foreground">
        {minutes}m ago
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Solar Power */}
      <DashboardCard
        title="Solar Power"
        className={`${getStatusColor('solar')} relative`}
      >
        <div className="absolute top-3 right-3">
          <ConnectionIndicator />
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
            <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {formatValue(kpiData.solarPower.value, 1)} {kpiData.solarPower.unit}
            </div>
            <p className="text-sm text-muted-foreground">Current Generation</p>
            <LastUpdate />
          </div>
        </div>

        {kpiData.solarPower.value > 0 && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-xs">
              {kpiData.solarPower.value > 2 ? 'High' : kpiData.solarPower.value > 1 ? 'Medium' : 'Low'} Output
            </Badge>
          </div>
        )}
      </DashboardCard>

      {/* Battery Status */}
      <DashboardCard
        title="Battery Status"
        className={getStatusColor('battery')}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
            <Battery className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {formatValue(kpiData.batterySOC.value, 1)}{kpiData.batterySOC.unit}
            </div>
            <p className="text-sm text-muted-foreground">State of Charge</p>
            <LastUpdate />
          </div>
        </div>

        <div className="mt-2">
          <Badge
            variant={
              kpiData.batterySOC.value >= 80 ? 'default' :
              kpiData.batterySOC.value >= 40 ? 'secondary' :
              kpiData.batterySOC.value >= 20 ? 'destructive' : 'destructive'
            }
            className="text-xs"
          >
            {kpiData.batterySOC.value >= 80 ? 'Good' :
             kpiData.batterySOC.value >= 40 ? 'Fair' :
             kpiData.batterySOC.value >= 20 ? 'Low' : 'Critical'}
          </Badge>
        </div>
      </DashboardCard>

      {/* Grid Voltage */}
      <DashboardCard
        title="Grid Voltage"
        className={getStatusColor('grid')}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
            <Grid3X3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {formatValue(kpiData.gridVoltage.value, 0)}{kpiData.gridVoltage.unit}
            </div>
            <p className="text-sm text-muted-foreground">AC Voltage</p>
            <LastUpdate />
          </div>
        </div>

        <div className="mt-2">
          <Badge
            variant={
              Math.abs(kpiData.gridVoltage.value - 230) < 5 ? 'default' :
              Math.abs(kpiData.gridVoltage.value - 230) < 10 ? 'secondary' : 'destructive'
            }
            className="text-xs"
          >
            {Math.abs(kpiData.gridVoltage.value - 230) < 5 ? 'Stable' :
             Math.abs(kpiData.gridVoltage.value - 230) < 10 ? 'Fluctuating' : 'Unstable'}
          </Badge>
        </div>
      </DashboardCard>

      {/* Daily Energy */}
      <DashboardCard
        title="Daily Energy"
        className={getStatusColor('energy')}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
            <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {formatValue(kpiData.dailyEnergy.value, 1)} {kpiData.dailyEnergy.unit}
            </div>
            <p className="text-sm text-muted-foreground">Generated Today</p>
            <LastUpdate />
          </div>
        </div>

        <div className="mt-2">
          <Badge variant="secondary" className="text-xs">
            {kpiData.dailyEnergy.value > 20 ? 'Excellent' :
             kpiData.dailyEnergy.value > 15 ? 'Good' :
             kpiData.dailyEnergy.value > 10 ? 'Fair' : 'Low'} Production
          </Badge>
        </div>
      </DashboardCard>
    </div>
  )
}