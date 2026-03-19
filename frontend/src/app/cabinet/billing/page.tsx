"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, Download, FileText } from "lucide-react"

// Import components
import { BillingStatsCards } from "./components/BillingStatsCards"
import { RevenueChart } from "./components/RevenueChart"
import { TransactionsTable, Transaction } from "./components/TransactionsTable"

// Mock data
const billingStats = {
  totalRevenue: 125000000,
  monthlyRevenue: 18500000,
  pendingPayments: 3200000,
  overduePayments: 1500000,
  paidThisMonth: 42,
  pendingCount: 8,
}

const revenueByMonth = [
  { month: "Sent", revenue: 15000000, paid: 38 },
  { month: "Okt", revenue: 16200000, paid: 41 },
  { month: "Noy", revenue: 15800000, paid: 39 },
  { month: "Dek", revenue: 17500000, paid: 45 },
  { month: "Yan", revenue: 18500000, paid: 42 },
  { month: "Fev", revenue: 12000000, paid: 28 },
]

const transactions: Transaction[] = [
  {
    id: "1",
    collegeName: "Toshkent Tibbiyot Texnikumi",
    amount: 5000000,
    type: "subscription",
    plan: "Enterprise",
    date: "2025-02-13",
    status: "paid",
    method: "Bank o'tkazmasi",
    invoice: "INV-2025-001",
  },
  {
    id: "2",
    collegeName: "Samarqand Tibbiyot Kolleji",
    amount: 2500000,
    type: "subscription",
    plan: "Pro",
    date: "2025-02-12",
    status: "paid",
    method: "Click",
    invoice: "INV-2025-002",
  },
  {
    id: "3",
    collegeName: "Buxoro Tibbiyot Texnikumi",
    amount: 1000000,
    type: "subscription",
    plan: "Basic",
    date: "2025-02-11",
    status: "pending",
    method: "Payme",
    invoice: "INV-2025-003",
  },
  {
    id: "4",
    collegeName: "Andijon Tibbiyot Kolleji",
    amount: 2500000,
    type: "subscription",
    plan: "Pro",
    date: "2025-02-10",
    status: "paid",
    method: "Bank o'tkazmasi",
    invoice: "INV-2025-004",
  },
  {
    id: "5",
    collegeName: "Namangan Tibbiyot Kolleji",
    amount: 2500000,
    type: "renewal",
    plan: "Pro",
    date: "2025-02-10",
    status: "overdue",
    method: "-",
    invoice: "INV-2025-005",
  },
  {
    id: "6",
    collegeName: "Qashqadaryo Tibbiyot Texnikumi",
    amount: 5000000,
    type: "subscription",
    plan: "Enterprise",
    date: "2025-02-09",
    status: "paid",
    method: "Bank o'tkazmasi",
    invoice: "INV-2025-006",
  },
  {
    id: "7",
    collegeName: "Surxondaryo Tibbiyot Kolleji",
    amount: 1000000,
    type: "subscription",
    plan: "Basic",
    date: "2025-02-08",
    status: "pending",
    method: "Click",
    invoice: "INV-2025-007",
  },
  {
    id: "8",
    collegeName: "Jizzax Tibbiyot Texnikumi",
    amount: 2500000,
    type: "renewal",
    plan: "Pro",
    date: "2025-02-07",
    status: "paid",
    method: "Payme",
    invoice: "INV-2025-008",
  },
]

export default function BillingPage() {
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("")

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.collegeName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">To'lovlar va Hisob-fakturalar</h1>
          <p className="text-muted-foreground">
            Barcha moliyaviy operatsiyalar va hisob-fakturalar
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Hisobot
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Excel Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <BillingStatsCards stats={billingStats} />

      {/* Revenue Chart */}
      <RevenueChart data={revenueByMonth} />

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tashkilot nomi bo'yicha qidirish..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[180px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Barcha statuslar</option>
              <option value="paid">To'langan</option>
              <option value="pending">Kutilmoqda</option>
              <option value="overdue">Muddati o'tgan</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <TransactionsTable transactions={filteredTransactions} />

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Jami: {filteredTransactions.length} ta tranzaksiya
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Oldingi
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-white">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Keyingi
          </Button>
        </div>
      </div>
    </div>
  )
}
