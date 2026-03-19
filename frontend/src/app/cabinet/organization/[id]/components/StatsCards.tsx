"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, TrendingUp, CreditCard, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

interface StatsCardsProps {
  studentsCount: number
  groupsCount: number
  totalRevenue: number
  subscriptionEndsAt?: string | null
  trialEndsAt?: string | null
}

export function StatsCards({
  studentsCount,
  groupsCount,
  totalRevenue,
  subscriptionEndsAt,
  trialEndsAt,
}: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Talabalar</p>
              <p className="text-2xl font-bold">{studentsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Guruhlar</p>
              <p className="text-2xl font-bold">{groupsCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Jami aylanma</p>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Obuna tugash</p>
              <p className="text-2xl font-bold">
                {formatDate(subscriptionEndsAt || trialEndsAt || "-")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}