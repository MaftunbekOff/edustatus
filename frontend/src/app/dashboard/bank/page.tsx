"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

// Mock data - Bank reconciliation
const bankRecords = [
  {
    id: "1",
    date: "2025-01-15",
    amount: 1500000,
    payer: "Aliyev Anvar Abdullaevich",
    purpose: "Shartnoma to'lovi",
    status: "matched",
    studentId: "STU-001",
  },
  {
    id: "2",
    date: "2025-01-15",
    amount: 2000000,
    payer: "Valiyeva Dilnoza",
    purpose: "Shartnoma to'lovi",
    status: "unmatched",
    studentId: null,
  },
  {
    id: "3",
    date: "2025-01-14",
    amount: 1000000,
    payer: "Karimov Bobur",
    purpose: "Shartnoma to'lovi",
    status: "pending",
    studentId: null,
  },
  {
    id: "4",
    date: "2025-01-14",
    amount: 2500000,
    payer: "Najimova Nigora",
    purpose: "Shartnoma to'lovi",
    status: "matched",
    studentId: "STU-004",
  },
  {
    id: "5",
    date: "2025-01-13",
    amount: 500000,
    payer: "Rahimov Jahongir",
    purpose: "Shartnoma to'lovi",
    status: "rejected",
    studentId: null,
  },
]

export default function BankPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "matched":
        return <Badge variant="success">Mos keladi</Badge>
      case "unmatched":
        return <Badge variant="warning">Mos emas</Badge>
      case "pending":
        return <Badge variant="secondary">Kutilmoqda</Badge>
      case "rejected":
        return <Badge variant="error">Rad etilgan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const matchedAmount = bankRecords
    .filter((r) => r.status === "matched")
    .reduce((sum, r) => sum + r.amount, 0)
  const unmatchedCount = bankRecords.filter((r) => r.status === "unmatched").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bank Reestr</h1>
          <p className="text-muted-foreground">
            Bank to'lovlarini avtomatik biriktirish
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sinxronizatsiya
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami yozuvlar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankRecords.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mos kelganlar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(matchedAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mos kelmayanlar</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{unmatchedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilayotgan</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {bankRecords.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-reconciliation info */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-green-800">Avtomatik biriktirish yoqilgan</h3>
              <p className="text-sm text-green-600">
                Bank to'lovlari avtomatik ravishda talabalarga biriktiriladi. 95% aniqlik!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Records Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>To'lovchi</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Maqsad</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Talaba</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell className="font-medium">{record.payer}</TableCell>
                  <TableCell>{formatCurrency(record.amount)}</TableCell>
                  <TableCell>{record.purpose}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell>
                    {record.studentId ? (
                      <Badge variant="secondary">{record.studentId}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {record.status === "unmatched" && (
                      <Button variant="ghost" size="sm">
                        Biriktirish
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
