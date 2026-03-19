"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency, formatDate, getStatusText } from "@/lib/utils"
import { Payment } from "../hooks/useDashboardData"

interface RecentPaymentsTableProps {
  payments: Payment[]
}

export function RecentPaymentsTable({ payments }: RecentPaymentsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">So'nggi to'lovlar</CardTitle>
        <a
          href="/dashboard/payments"
          className="text-sm text-primary hover:underline"
        >
          Barchasini ko'rish
        </a>
      </CardHeader>
      <CardContent>
        {payments.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talaba</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">
                    {payment.studentName}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "confirmed"
                          ? "success"
                          : payment.status === "pending"
                          ? "warning"
                          : "error"
                      }
                    >
                      {getStatusText(payment.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground py-4">
            To'lovlar mavjud emas
          </p>
        )}
      </CardContent>
    </Card>
  )
}