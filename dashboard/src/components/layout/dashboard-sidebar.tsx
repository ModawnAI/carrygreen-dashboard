"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BarChart3,
  Battery,
  Settings,
  Download,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  isActive?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    isActive: true
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3
  },
  {
    title: "Battery",
    href: "/battery",
    icon: Battery
  },
  {
    title: "Export",
    href: "/export",
    icon: Download
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings
  }
]

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col border-r bg-background transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Collapse Toggle */}
        <div className="flex h-16 items-center justify-end px-4 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.href}
                variant={item.isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isCollapsed && "px-2"
                )}
                asChild
              >
                <a href={item.href}>
                  <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <span className="truncate">{item.title}</span>
                  )}
                </a>
              </Button>
            )
          })}
        </nav>

        {/* Status Panel (when expanded) */}
        {!isCollapsed && (
          <div className="border-t p-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">System Status</div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Solar</span>
                  <span className="text-green-600 font-medium">Active</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Grid</span>
                  <span className="text-green-600 font-medium">Connected</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Battery</span>
                  <span className="text-blue-600 font-medium">Charging</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Navigation Spacer */}
      <div className="lg:hidden h-16" />
    </>
  )
}