"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, CheckCircle, AlertTriangle, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface SubscriptionStats {
  total: number
  active: number
  expiring: number
  expired: number
  monthlyRevenue: number
}

interface SubscriptionStatsCardsProps {
  stats: SubscriptionStats
}

export function SubscriptionStatsCards({ stats }: SubscriptionStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami obunalar</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faol</p>
              <p className="text-xl font-bold text-green-600">{stats.active}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tugayotgan</p>
              <p className="text-xl font-bold text-yellow-600">{stats.expiring}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tugagan</p>
              <p className="text-xl font-bold text-red-600">{stats.expired}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Oylik daromad</p>
              <p className="text-xl font-bold">{formatCurrency(stats.monthlyRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}