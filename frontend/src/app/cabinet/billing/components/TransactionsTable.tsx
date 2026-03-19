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
import { Download, FileText } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

export interface Transaction {
  id: string
  collegeName: string
  amount: number
  type: string
  plan: string
  date: string
  status: string
  method: string
  invoice: string
}

const statusConfig: Record<string, { color: "success" | "warning" | "error" | "secondary"; label: string }> = {
  paid: { color: "success", label: "To'langan" },
  pending: { color: "warning", label: "Kutilmoqda" },
  overdue: { color: "error", label: "Muddati o'tgan" },
}

interface TransactionsTableProps {
  transactions: Transaction[]
}

export function TransactionsTable({ transactions }: TransactionsTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hisob-faktura</TableHead>
              <TableHead>Tashkilot</TableHead>
              <TableHead>Tarif</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead>To'lov usuli</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const config = statusConfig[tx.status]
              return (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-sm">{tx.invoice}</TableCell>
                  <TableCell className="font-medium">{tx.collegeName}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        tx.plan === "Enterprise"
                          ? "default"
                          : tx.plan === "Pro"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {tx.plan}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(tx.amount)}</TableCell>
                  <TableCell>{formatDate(tx.date)}</TableCell>
                  <TableCell>{tx.method}</TableCell>
                  <TableCell>
                    <Badge variant={config.color}>{config.label}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
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