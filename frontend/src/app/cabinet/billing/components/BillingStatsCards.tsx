"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Clock, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface BillingStats {
  totalRevenue: number
  monthlyRevenue: number
  pendingPayments: number
  overduePayments: number
  paidThisMonth: number
  pendingCount: number
}

interface BillingStatsCardsProps {
  stats: BillingStats
}

export function BillingStatsCards({ stats }: BillingStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami daromad</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Oylik daromad</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Kutilayotgan to'lovlar</p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(stats.pendingPayments)}
              </p>
              <p className="text-xs text-yellow-600 mt-1">{stats.pendingCount} ta</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Muddati o'tgan</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(stats.overduePayments)}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}