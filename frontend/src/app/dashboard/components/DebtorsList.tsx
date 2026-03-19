"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Debtor } from "../hooks/useDashboardData"

interface DebtorsListProps {
  debtors: Debtor[]
}

export function DebtorsList({ debtors }: DebtorsListProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Katta qarzdorlar</CardTitle>
        <a
          href="/dashboard/students?filter=debtors"
          className="text-sm text-primary hover:underline"
        >
          Barchasini ko'rish
        </a>
      </CardHeader>
      <CardContent>
        {debtors.length > 0 ? (
          <div className="space-y-4">
            {debtors.map((debtor, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">{debtor.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {debtor.group}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">
                    {formatCurrency(debtor.debt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            Qarzdorlar mavjud emas
          </p>
        )}
      </CardContent>
    </Card>
  )
}