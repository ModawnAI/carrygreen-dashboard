"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, Wifi, WifiOff, Battery, Zap } from "lucide-react"

interface SystemStatus {
  isOnline: boolean
  batteryLevel: number
  powerGeneration: number
  lastUpdate: Date
}

export function DashboardHeader() {
  const [systemStatus] = useState<SystemStatus>({
    isOnline: true,
    batteryLevel: 85,
    powerGeneration: 2.4,
    lastUpdate: new Date()
  })

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>

          <div className="flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">CarryGreen</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Solar Power Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {systemStatus.isOnline ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {systemStatus.isOnline ? "Online" : "Offline"}
            </span>
          </div>

          {/* Battery Level */}
          <div className="flex items-center space-x-2">
            <Battery className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium hidden sm:inline">
              {systemStatus.batteryLevel}%
            </span>
          </div>

          {/* Power Generation */}
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-yellow-500" />
            <span className="text-sm font-medium hidden sm:inline">
              {systemStatus.powerGeneration}kW
            </span>
          </div>

          {/* Last Update */}
          <div className="text-xs text-muted-foreground hidden md:block">
            Updated: {systemStatus.lastUpdate.toLocaleTimeString()}
          </div>

          {/* User Avatar */}
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">CG</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <div className="border-t bg-background/95 backdrop-blur">
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                <a
                  href="#dashboard"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Dashboard
                </a>
                <a
                  href="#analytics"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Analytics
                </a>
                <a
                  href="#settings"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Settings
                </a>
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}