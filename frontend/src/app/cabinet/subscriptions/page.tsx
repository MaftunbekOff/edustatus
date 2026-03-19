"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Send } from "lucide-react"

// Import components
import { SubscriptionStatsCards } from "./components/SubscriptionStatsCards"
import { ExpiringAlert } from "./components/ExpiringAlert"
import { SubscriptionFilters } from "./components/SubscriptionFilters"
import { SubscriptionTable, Subscription } from "./components/SubscriptionTable"

// Mock data
const subscriptions: Subscription[] = [
  {
    id: "1",
    collegeName: "Toshkent Tibbiyot Texnikumi",
    plan: "enterprise",
    price: 5000000,
    startDate: "2024-01-15",
    endDate: "2025-12-31",
    status: "active",
    autoRenew: true,
    daysLeft: 321,
  },
  {
    id: "2",
    collegeName: "Samarqand Tibbiyot Kolleji",
    plan: "pro",
    price: 2500000,
    startDate: "2024-06-01",
    endDate: "2025-06-30",
    status: "active",
    autoRenew: true,
    daysLeft: 137,
  },
  {
    id: "3",
    collegeName: "Buxoro Tibbiyot Texnikumi",
    plan: "basic",
    price: 1000000,
    startDate: "2025-01-20",
    endDate: "2025-02-20",
    status: "trial",
    autoRenew: false,
    daysLeft: 7,
  },
  {
    id: "4",
    collegeName: "Namangan Tibbiyot Kolleji",
    plan: "pro",
    price: 2500000,
    startDate: "2024-08-16",
    endDate: "2025-02-16",
    status: "expiring",
    autoRenew: true,
    daysLeft: 3,
  },
  {
    id: "5",
    collegeName: "Farg'ona Tibbiyot Texnikumi",
    plan: "basic",
    price: 1000000,
    startDate: "2024-07-10",
    endDate: "2025-01-10",
    status: "expired",
    autoRenew: false,
    daysLeft: -34,
  },
  {
    id: "6",
    collegeName: "Qashqadaryo Tibbiyot Texnikumi",
    plan: "enterprise",
    price: 5000000,
    startDate: "2024-10-20",
    endDate: "2025-10-20",
    status: "active",
    autoRenew: true,
    daysLeft: 249,
  },
  {
    id: "7",
    collegeName: "Surxondaryo Tibbiyot Kolleji",
    plan: "basic",
    price: 1000000,
    startDate: "2024-08-20",
    endDate: "2025-02-20",
    status: "expiring",
    autoRenew: false,
    daysLeft: 7,
  },
  {
    id: "8",
    collegeName: "Jizzax Tibbiyot Texnikumi",
    plan: "pro",
    price: 2500000,
    startDate: "2024-11-10",
    endDate: "2025-02-10",
    status: "expiring",
    autoRenew: true,
    daysLeft: -3,
  },
]

export default function SubscriptionsPage() {
  const [search, setSearch] = React.useState("")
  const [planFilter, setPlanFilter] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.collegeName.toLowerCase().includes(search.toLowerCase())
    const matchesPlan = !planFilter || sub.plan === planFilter
    const matchesStatus = !statusFilter || sub.status === statusFilter
    return matchesSearch && matchesPlan && matchesStatus
  })

  // Calculate stats
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === "active").length,
    expiring: subscriptions.filter((s) => s.status === "expiring" || (s.daysLeft <= 7 && s.daysLeft > 0)).length,
    expired: subscriptions.filter((s) => s.status === "expired" || s.daysLeft < 0).length,
    monthlyRevenue: subscriptions
      .filter((s) => s.status === "active" || s.status === "expiring")
      .reduce((sum, s) => sum + s.price, 0),
  }

  // Get expiring subscriptions for alert
  const expiringSubscriptions = subscriptions
    .filter((s) => s.daysLeft <= 7 && s.daysLeft > 0)
    .map((s) => ({ id: s.id, collegeName: s.collegeName, daysLeft: s.daysLeft }))

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Obunalar boshqaruvi</h1>
          <p className="text-muted-foreground">
            Barcha tashkilotlar obunalari va ularning holati
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Eslatma yuborish
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <SubscriptionStatsCards stats={stats} />

      {/* Expiring Soon Alert */}
      <ExpiringAlert 
        expiringCount={stats.expiring} 
        expiringSubscriptions={expiringSubscriptions} 
      />

      {/* Filters */}
      <SubscriptionFilters
        search={search}
        planFilter={planFilter}
        statusFilter={statusFilter}
        onSearchChange={setSearch}
        onPlanFilterChange={setPlanFilter}
        onStatusFilterChange={setStatusFilter}
      />

      {/* Subscriptions Table */}
      <SubscriptionTable subscriptions={filteredSubscriptions} />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Jami: {filteredSubscriptions.length} ta obuna
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Oldingi
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            Keyingi
          </Button>
        </div>
      </div>
    </div>
  )
}
