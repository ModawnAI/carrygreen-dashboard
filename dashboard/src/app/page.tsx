import { DashboardLayout, DashboardGrid, DashboardCard } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { TrendingUp } from "lucide-react"
import { KPICards } from "@/components/dashboard/kpi-cards"
import { BatteryGauge } from "@/components/dashboard/battery-gauge"

export default function Home() {
  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor your solar power system in real-time
        </p>
      </div>

      {/* Real-time KPI Cards */}
      <div className="mb-8">
        <KPICards />
      </div>

      {/* Main Content Grid */}
      <DashboardGrid className="grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Battery Gauge */}
        <BatteryGauge className="col-span-1" />

        {/* Time Series Chart - Takes up 2 columns */}
        <DashboardCard
          title="Power Generation"
          description="Real-time power generation over time"
          className="col-span-1 lg:col-span-2"
        >
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chart will be implemented with Nivo</p>
              <Button variant="outline" className="mt-4">
                View Analytics
              </Button>
            </div>
          </div>
        </DashboardCard>
      </DashboardGrid>

      {/* System Status and Controls */}
      <DashboardGrid className="grid-cols-1 md:grid-cols-2 mt-6">
        <DashboardCard
          title="System Status"
          description="Current system health and alerts"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Solar Panels</span>
              <span className="text-sm font-medium text-green-600">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Inverter</span>
              <span className="text-sm font-medium text-green-600">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Grid Connection</span>
              <span className="text-sm font-medium text-green-600">Connected</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Data Logger</span>
              <span className="text-sm font-medium text-blue-600">Recording</span>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard
          title="Quick Actions"
          description="System controls and data export"
        >
          <div className="space-y-4">
            <Button className="w-full" variant="outline">
              Export Data
            </Button>
            <Button className="w-full" variant="outline">
              Generate Report
            </Button>
            <Button className="w-full" variant="outline">
              System Settings
            </Button>
            <a href="/test-parser">
              <Button className="w-full" variant="secondary">
                Test CSV Parser
              </Button>
            </a>
          </div>
        </DashboardCard>
      </DashboardGrid>
    </DashboardLayout>
  );
}
