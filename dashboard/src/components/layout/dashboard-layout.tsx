"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardHeader } from "./dashboard-header"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardErrorBoundary } from "@/components/ui/error-boundary"

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-['Noto_Sans_KR']">
      {/* Header */}
      <DashboardHeader />

      <div className="flex">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface DashboardGridProps {
  children: ReactNode
  className?: string
}

export function DashboardGrid({ children, className = "" }: DashboardGridProps) {
  return (
    <div className={`grid gap-4 md:gap-6 lg:gap-8 ${className}`}>
      {children}
    </div>
  )
}

interface DashboardCardProps {
  title?: string
  description?: string
  children: ReactNode
  className?: string
}

export function DashboardCard({
  title,
  description,
  children,
  className = ""
}: DashboardCardProps) {
  return (
    <DashboardErrorBoundary>
      <Card className={`transition-all duration-200 hover:shadow-md ${className}`}>
        {(title || description) && (
          <CardHeader className="pb-3">
            {title && <CardTitle className="text-lg">{title}</CardTitle>}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardHeader>
        )}
        <CardContent className={title || description ? "pt-0" : ""}>
          {children}
        </CardContent>
      </Card>
    </DashboardErrorBoundary>
  )
}