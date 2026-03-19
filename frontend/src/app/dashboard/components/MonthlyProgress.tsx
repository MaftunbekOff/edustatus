"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface MonthlyProgressProps {
  monthlyActual: number
  monthlyPlan: number
  monthlyPercent: number
}

export function MonthlyProgress({
  monthlyActual,
  monthlyPlan,
  monthlyPercent,
}: MonthlyProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Oylik reja bajarilishi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatCurrency(monthlyActual)} / {formatCurrency(monthlyPlan)}
            </span>
            <span className="text-sm font-medium">{monthlyPercent}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-4 rounded-full bg-primary transition-all"
              style={{ width: `${monthlyPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            {monthlyPercent >= 50 ? (
              <>
                <ArrowUpRight className="h-4 w-4 text-green-600" />
                <span className="text-green-600">
                  Yaxshi natija! Reja bajarilmoqda
                </span>
              </>
            ) : (
              <>
                <ArrowDownRight className="h-4 w-4 text-red-600" />
                <span className="text-red-600">
                  Reja bajarilmadi, choralar ko'rish kerak
                </span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}