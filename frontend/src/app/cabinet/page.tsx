"use client"

import { Button } from "@/components/ui/button"
import { Building2, Activity } from "lucide-react"

// Import hook
import { useCabinetData } from "./hooks/useCabinetData"

// Import components
import { StatsCards } from "./components/StatsCards"
import { DistributionCharts } from "./components/DistributionCharts"
import { OrganizationsTable } from "./components/OrganizationsTable"
import { QuickStats } from "./components/QuickStats"

export default function CabinetDashboard() {
  const { stats, organizations, loading, error } = useCabinetData()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cabinet Dashboard</h1>
          <p className="text-muted-foreground">
            Barcha tashkilotlar bo'yicha umumiy statistika va boshqaruv
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Hisobot
          </Button>
          <Button>
            <Building2 className="mr-2 h-4 w-4" />
            Yangi tashkilot
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} organizations={organizations} />

      {/* Charts Row */}
      <DistributionCharts organizations={organizations} />

      {/* Recent Organizations Table */}
      <OrganizationsTable organizations={organizations} />

      {/* Quick Stats */}
      <QuickStats stats={stats} />
    </div>
  )
}
