import { DashboardLayout, DashboardGrid, DashboardCard } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Battery, Zap, Grid3X3, TrendingUp } from "lucide-react"

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

      {/* KPI Cards Grid */}
      <DashboardGrid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <DashboardCard title="Solar Power" className="border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-yellow-500" />
            <div>
              <div className="text-2xl font-bold">2.4 kW</div>
              <p className="text-sm text-muted-foreground">Current Generation</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Battery Status" className="border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-2">
            <Battery className="h-8 w-8 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-sm text-muted-foreground">State of Charge</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Grid Voltage" className="border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-2">
            <Grid3X3 className="h-8 w-8 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">230V</div>
              <p className="text-sm text-muted-foreground">AC Voltage</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Daily Energy" className="border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-green-500" />
            <div>
              <div className="text-2xl font-bold">18.5 kWh</div>
              <p className="text-sm text-muted-foreground">Generated Today</p>
            </div>
          </div>
        </DashboardCard>
      </DashboardGrid>

      {/* Main Content Grid */}
      <DashboardGrid className="grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Battery Gauge - Takes up 1 column */}
        <DashboardCard
          title="Battery Gauge"
          description="Real-time battery charge level"
          className="col-span-1"
        >
          <div className="flex items-center justify-center h-64">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-gray-700 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-sm text-muted-foreground">SOC</div>
                </div>
              </div>
              <div className="absolute inset-0 w-32 h-32 rounded-full border-8 border-transparent border-t-blue-500 animate-pulse"></div>
            </div>
          </div>
        </DashboardCard>

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
