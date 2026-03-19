"use client"

import { StatsCard } from "@/components/dashboard/stats-card"
import { AlertTriangle, TrendingUp, Users, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Import hook
import { useDashboardData } from "./hooks/useDashboardData"

// Import components
import { RevenueChart, PaymentMethodsChart, GroupStatsChart } from "./components/Charts"
import { RecentPaymentsTable } from "./components/RecentPaymentsTable"
import { DebtorsList } from "./components/DebtorsList"
import { MonthlyProgress } from "./components/MonthlyProgress"

export default function DashboardPage() {
  const { stats, recentPayments, debtors, isLoading, error } = useDashboardData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Tibbiyot texnikumi moliyaviy ko'rsatkichlari
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Bugungi tushumlar"
          value={formatCurrency(stats?.todayPayments || 0)}
          description={`${stats?.todayCount || 0} ta to'lov`}
          icon={TrendingUp}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Oylik reja"
          value={formatCurrency(stats?.monthlyActual || 0)}
          description={`${stats?.monthlyPercent || 0}% bajarilgan`}
          icon={DollarSign}
          trend={{ value: 5, isPositive: true }}
        />
        <StatsCard
          title="Jami talabalar"
          value={stats?.totalStudents || 0}
          description={`${stats?.activeStudents || 0} ta faol`}
          icon={Users}
        />
        <StatsCard
          title="Jami qarzdorlik"
          value={formatCurrency(stats?.totalDebt || 0)}
          description="Barcha talabalar"
          icon={AlertTriangle}
          className="border-yellow-200 bg-yellow-50"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart />
        <PaymentMethodsChart />
      </div>

      {/* Group Statistics Chart */}
      <GroupStatsChart />

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentPaymentsTable payments={recentPayments} />
        <DebtorsList debtors={debtors} />
      </div>

      {/* Monthly Progress */}
      <MonthlyProgress
        monthlyActual={stats?.monthlyActual || 0}
        monthlyPlan={stats?.monthlyPlan || 0}
        monthlyPercent={stats?.monthlyPercent || 0}
      />
    </div>
  )
}
