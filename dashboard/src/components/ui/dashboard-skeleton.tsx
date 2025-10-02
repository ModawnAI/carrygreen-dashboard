import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <KPISkeleton key={i} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Battery Gauge Skeleton */}
        <Card className="col-span-1">
          <CardHeader>
            <Skeleton className="h-5 w-[120px]" />
            <Skeleton className="h-4 w-[180px]" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64">
              <Skeleton className="w-32 h-32 rounded-full" />
            </div>
          </CardContent>
        </Card>

        {/* Chart Skeleton */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-5 w-[140px]" />
            <Skeleton className="h-4 w-[220px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* System Status and Controls Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SystemStatusSkeleton />
        <QuickActionsSkeleton />
      </div>
    </div>
  )
}

export function KPISkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-[100px]" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-8 rounded" />
          <div className="space-y-1">
            <Skeleton className="h-6 w-[60px]" />
            <Skeleton className="h-4 w-[120px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SystemStatusSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-4 w-[180px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[60px]" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-[120px]" />
        <Skeleton className="h-4 w-[180px]" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Title Skeleton */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="space-y-1">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-3 w-[140px]" />
            </div>
          </div>
        </div>

        {/* Status Indicators Skeleton */}
        <div className="flex items-center space-x-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-[40px]" />
            </div>
          ))}
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </div>
    </header>
  )
}

export function SidebarSkeleton() {
  return (
    <aside className="hidden lg:flex flex-col border-r bg-background w-64">
      {/* Header */}
      <div className="flex h-16 items-center justify-end px-4 border-b">
        <Skeleton className="h-8 w-8" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3 p-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ))}
      </nav>

      {/* Status Panel */}
      <div className="border-t p-4">
        <Skeleton className="h-4 w-[100px] mb-2" />
        <div className="space-y-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-3 w-[60px]" />
              <Skeleton className="h-3 w-[50px]" />
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}