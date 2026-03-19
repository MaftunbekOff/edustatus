"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CreditCard, TrendingUp, Users } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { CabinetStats } from "../hooks/useCabinetData"

interface QuickStatsProps {
  stats: CabinetStats | null
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">O'rtacha daromad/tashkilot</p>
              <p className="text-xl font-bold">
                {formatCurrency((stats?.totalRevenue || 0) / (stats?.totalOrganizations || 1))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">O'rtacha talabalar/tashkilot</p>
              <p className="text-xl font-bold">
                {Math.round((stats?.totalStudents || 0) / (stats?.totalOrganizations || 1))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faol tashkilotlar</p>
              <p className="text-xl font-bold">{stats?.activeOrganizations || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
