"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Select } from "@/components/ui/select"
import {
  Search,
  Plus,
  Download,
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { formatCurrency, formatDate, getStatusText } from "@/lib/utils"

// Mock data
const payments = [
  {
    id: "1",
    studentName: "Aliyev Anvar Abdullaevich",
    amount: 1500000,
    date: "2025-01-15",
    method: "Bank",
    status: "confirmed",
    receiptNo: "RCP-001",
  },
  {
    id: "2",
    studentName: "Valiyeva Dilnoza Karimovna",
    amount: 2000000,
    date: "2025-01-15",
    method: "Click",
    status: "pending",
    receiptNo: "RCP-002",
  },
  {
    id: "3",
    studentName: "Karimov Bobur Rahimovich",
    amount: 1000000,
    date: "2025-01-14",
    method: "Naqd",
    status: "confirmed",
    receiptNo: "RCP-003",
  },
  {
    id: "4",
    studentName: "Najimova Nigora Bahodirovna",
    amount: 2500000,
    date: "2025-01-14",
    method: "Bank",
    status: "confirmed",
    receiptNo: "RCP-004",
  },
  {
    id: "5",
    studentName: "Rahimov Jahongir Toshmatovich",
    amount: 500000,
    date: "2025-01-13",
    method: "Payme",
    status: "rejected",
    receiptNo: "RCP-005",
  },
]

export default function PaymentsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch = payment.studentName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.method === methodFilter
    return matchesSearch && matchesStatus && matchesMethod
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge variant="success">Tasdiqlangan</Badge>
      case "pending":
        return <Badge variant="warning">Kutilmoqda</Badge>
      case "rejected":
        return <Badge variant="error">Rad etilgan</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0)
  const confirmedAmount = filteredPayments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">To'lovlar</h1>
          <p className="text-muted-foreground">Barcha to'lovlar ro'yxati</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          To'lov qo'shish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami to'lovlar</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasdiqlangan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(confirmedAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilayotgan</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {payments.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rad etilgan</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {payments.filter((p) => p.status === "rejected").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Talaba ismi bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha statuslar" },
                { value: "confirmed", label: "Tasdiqlangan" },
                { value: "pending", label: "Kutilmoqda" },
                { value: "rejected", label: "Rad etilgan" },
              ]}
              className="w-[150px]"
            />
            <Select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha usullar" },
                { value: "Bank", label: "Bank" },
                { value: "Click", label: "Click" },
                { value: "Payme", label: "Payme" },
                { value: "Naqd", label: "Naqd" },
              ]}
              className="w-[150px]"
            />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kvitansiya</TableHead>
                <TableHead>Talaba</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead>Usul</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-mono">{payment.receiptNo}</TableCell>
                  <TableCell className="font-medium">{payment.studentName}</TableCell>
                  <TableCell>{formatCurrency(payment.amount)}</TableCell>
                  <TableCell>{formatDate(payment.date)}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payment.method}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(payment.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Ko'rish
                    </Button>
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
