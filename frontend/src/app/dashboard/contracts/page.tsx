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
  FileSignature,
  Download,
  Eye,
  Printer,
  CheckCircle,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"

// Mock data
const contracts = [
  {
    id: "1",
    studentName: "Aliyev Anvar Abdullaevich",
    contractNo: "SH-2025-001",
    amount: 12000000,
    date: "2025-01-10",
    status: "signed",
    signedAt: "2025-01-12",
  },
  {
    id: "2",
    studentName: "Valiyeva Dilnoza Karimovna",
    contractNo: "SH-2025-002",
    amount: 12000000,
    date: "2025-01-10",
    status: "pending",
    signedAt: null,
  },
  {
    id: "3",
    studentName: "Karimov Bobur Rahimovich",
    contractNo: "SH-2025-003",
    amount: 12000000,
    date: "2025-01-08",
    status: "signed",
    signedAt: "2025-01-09",
  },
  {
    id: "4",
    studentName: "Najimova Nigora Bahodirovna",
    contractNo: "SH-2025-004",
    amount: 15000000,
    date: "2025-01-05",
    status: "expired",
    signedAt: null,
  },
  {
    id: "5",
    studentName: "Rahimov Jahongir Toshmatovich",
    contractNo: "SH-2025-005",
    amount: 12000000,
    date: "2025-01-15",
    status: "draft",
    signedAt: null,
  },
]

export default function ContractsPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "signed":
        return <Badge variant="success">Imzolangan</Badge>
      case "pending":
        return <Badge variant="warning">Kutilmoqda</Badge>
      case "expired":
        return <Badge variant="error">Muddati o'tgan</Badge>
      case "draft":
        return <Badge variant="secondary">Qoralama</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const signedAmount = contracts
    .filter((c) => c.status === "signed")
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Shartnomalar</h1>
          <p className="text-muted-foreground">
            Avtomatik shartnoma generatsiyasi va boshqaruvi
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami shartnomalar</CardTitle>
            <FileSignature className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imzolangan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {contracts.filter((c) => c.status === "signed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Imzolangan summa</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(signedAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {contracts.filter((c) => c.status === "pending").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-generation info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <FileSignature className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800">Avtomatik generatsiya</h3>
              <p className="text-sm text-blue-600">
                Shartnomalar avtomatik ravishda talaba ma'lumotlari asosida yaratiladi
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contracts Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shartnoma №</TableHead>
                <TableHead>Talaba</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Imzolangan</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-mono">{contract.contractNo}</TableCell>
                  <TableCell className="font-medium">{contract.studentName}</TableCell>
                  <TableCell>{formatCurrency(contract.amount)}</TableCell>
                  <TableCell>{formatDate(contract.date)}</TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
                  <TableCell>{contract.signedAt ? formatDate(contract.signedAt) : "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
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
