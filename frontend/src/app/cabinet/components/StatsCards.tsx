"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Building2, Users, DollarSign, AlertTriangle, ArrowUpRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { CabinetStats, OrganizationListItem } from "../hooks/useCabinetData"

interface StatsCardsProps {
  stats: CabinetStats | null
  organizations: OrganizationListItem[]
}

export function StatsCards({ stats, organizations }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami tashkilotlar</p>
              <p className="text-2xl font-bold">{stats?.totalOrganizations || 0}</p>
              <p className="text-xs text-green-600 mt-1">
                {stats?.activeOrganizations || 0} ta faol
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami talabalar</p>
              <p className="text-2xl font-bold">{stats?.totalStudents?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.activeOrganizations || 0} ta faol tashkilotda
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Jami daromad</p>
              <p className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-600">+12%</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sinov davrida</p>
              <p className="text-2xl font-bold text-yellow-600">
                {organizations.filter(o => o.status === 'trial').length}
              </p>
              <p className="text-xs text-yellow-600 mt-1">Trial holatda</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
