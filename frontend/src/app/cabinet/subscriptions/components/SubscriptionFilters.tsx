"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter } from "lucide-react"

interface SubscriptionFiltersProps {
  search: string
  planFilter: string
  statusFilter: string
  onSearchChange: (value: string) => void
  onPlanFilterChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
}

export function SubscriptionFilters({
  search,
  planFilter,
  statusFilter,
  onSearchChange,
  onPlanFilterChange,
  onStatusFilterChange,
}: SubscriptionFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tashkilot nomi bo'yicha qidirish..."
              className="pl-8"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[150px]"
            value={planFilter}
            onChange={(e) => onPlanFilterChange(e.target.value)}
          >
            <option value="">Barcha tariflar</option>
            <option value="basic">Basic</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:w-[150px]"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <option value="">Barcha statuslar</option>
            <option value="active">Faol</option>
            <option value="trial">Sinov</option>
            <option value="expiring">Tugaydi</option>
            <option value="expired">Tugagan</option>
          </select>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}