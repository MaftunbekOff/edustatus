"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CheckCircle, AlertTriangle, XCircle, Clock, Send } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export interface Subscription {
  id: string
  collegeName: string
  plan: string
  price: number
  startDate: string
  endDate: string
  status: string
  autoRenew: boolean
  daysLeft: number
}

const statusConfig: Record<string, { color: "success" | "warning" | "error" | "secondary"; label: string; icon: React.ElementType }> = {
  active: { color: "success", label: "Faol", icon: CheckCircle },
  trial: { color: "warning", label: "Sinov", icon: Clock },
  expiring: { color: "warning", label: "Tugaydi", icon: AlertTriangle },
  expired: { color: "error", label: "Tugagan", icon: XCircle },
}

interface SubscriptionTableProps {
  subscriptions: Subscription[]
}

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tashkilot</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>Narx</TableHead>
              <TableHead>Boshlanish</TableHead>
              <TableHead>Tugash</TableHead>
              <TableHead>Qolgan kun</TableHead>
              <TableHead>Avto-yangilash</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.map((sub) => {
              const config = statusConfig[sub.status] || statusConfig.active
              const StatusIcon = config.icon

              return (
                <TableRow key={sub.id}>
                  <TableCell className="font-medium">{sub.collegeName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        sub.plan === "enterprise"
                          ? "default"
                          : sub.plan === "pro"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {sub.plan.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(sub.price)}</TableCell>
                  <TableCell>{formatDate(sub.startDate)}</TableCell>
                  <TableCell>{formatDate(sub.endDate)}</TableCell>
                  <TableCell>
                    <span
                      className={
                        sub.daysLeft < 0
                          ? "text-red-600 font-medium"
                          : sub.daysLeft <= 7
                          ? "text-yellow-600 font-medium"
                          : ""
                      }
                    >
                      {sub.daysLeft < 0 ? `${Math.abs(sub.daysLeft)} kun o'tdi` : `${sub.daysLeft} kun`}
                    </span>
                  </TableCell>
                  <TableCell>
                    {sub.autoRenew ? (
                      <Badge variant="success">Yoqilgan</Badge>
                    ) : (
                      <Badge variant="secondary">O'chirilgan</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4" />
                      <Badge variant={config.color}>{config.label}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="outline" size="sm">
                        Yangilash
                      </Button>
                      {sub.daysLeft <= 7 && sub.daysLeft > 0 && (
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}