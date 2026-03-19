"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

interface Subscription {
  id: string
  collegeName: string
  daysLeft: number
}

interface ExpiringAlertProps {
  expiringCount: number
  expiringSubscriptions: Subscription[]
}

export function ExpiringAlert({ expiringCount, expiringSubscriptions }: ExpiringAlertProps) {
  if (expiringCount === 0) return null

  return (
    <Card className="border-yellow-200 bg-yellow-50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-lg text-yellow-800">
            Tez orada tugaydigan obunalar ({expiringCount})
          </CardTitle>
        </div>
        <CardDescription className="text-yellow-700">
          Quyidagi obunalar 7 kundan kam vaqt qolgan. Ularga eslatma yuboring!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {expiringSubscriptions.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-white px-3 py-2"
            >
              <span className="text-sm font-medium">{sub.collegeName}</span>
              <Badge variant="warning">{sub.daysLeft} kun</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}