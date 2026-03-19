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
  Download,
  Percent,
  TrendingUp,
  TrendingDown,
  Calculator,
  FileText,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data for taxes
const taxRecords = [
  {
    id: "1",
    employeeName: "Ahmedov Rustam Toshmatovich",
    grossSalary: 5000000,
    incomeTax: 750000,
    socialTax: 250000,
    pensionFund: 100000,
    totalTax: 1100000,
    netSalary: 3900000,
    month: "2024-06",
    status: "paid",
  },
  {
    id: "2",
    employeeName: "Karimova Dilfuza Bahodirovna",
    grossSalary: 4100000,
    incomeTax: 615000,
    socialTax: 205000,
    pensionFund: 82000,
    totalTax: 902000,
    netSalary: 3198000,
    month: "2024-06",
    status: "pending",
  },
  {
    id: "3",
    employeeName: "Valiyev Bobur Rahimovich",
    grossSalary: 6000000,
    incomeTax: 900000,
    socialTax: 300000,
    pensionFund: 120000,
    totalTax: 1320000,
    netSalary: 4680000,
    month: "2024-06",
    status: "paid",
  },
  {
    id: "4",
    employeeName: "Najimova Nigora Karimovna",
    grossSalary: 4100000,
    incomeTax: 615000,
    socialTax: 205000,
    pensionFund: 82000,
    totalTax: 902000,
    netSalary: 3198000,
    month: "2024-06",
    status: "pending",
  },
  {
    id: "5",
    employeeName: "Rahimov Jahongir Toshmatovich",
    grossSalary: 3800000,
    incomeTax: 570000,
    socialTax: 190000,
    pensionFund: 76000,
    totalTax: 836000,
    netSalary: 2964000,
    month: "2024-06",
    status: "paid",
  },
  {
    id: "6",
    employeeName: "Usmonova Gulnora Abdullaevna",
    grossSalary: 4400000,
    incomeTax: 660000,
    socialTax: 220000,
    pensionFund: 88000,
    totalTax: 968000,
    netSalary: 3432000,
    month: "2024-06",
    status: "paid",
  },
]

// Tax rates
const taxRates = {
  incomeTax: 15, // 15%
  socialTax: 5, // 5%
  pensionFund: 2, // 2%
}

export default function TaxesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredRecords = taxRecords.filter((record) => {
    const matchesSearch = record.employeeName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || record.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">To'langan</Badge>
      case "pending":
        return <Badge variant="warning">Kutilmoqda</Badge>
      case "overdue":
        return <Badge variant="error">Muddati o'tgan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Calculate statistics
  const totalGross = taxRecords.reduce((sum, r) => sum + r.grossSalary, 0)
  const totalIncomeTax = taxRecords.reduce((sum, r) => sum + r.incomeTax, 0)
  const totalSocialTax = taxRecords.reduce((sum, r) => sum + r.socialTax, 0)
  const totalPension = taxRecords.reduce((sum, r) => sum + r.pensionFund, 0)
  const totalTaxes = taxRecords.reduce((sum, r) => sum + r.totalTax, 0)
  const paidTaxes = taxRecords.filter(r => r.status === "paid").reduce((sum, r) => sum + r.totalTax, 0)
  const pendingTaxes = taxRecords.filter(r => r.status === "pending").reduce((sum, r) => sum + r.totalTax, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Soliqlar</h1>
          <p className="text-muted-foreground">
            Daromad solig'i, ijtimoiy soliq va pensiya ajratmalari
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calculator className="mr-2 h-4 w-4" />
            Hisoblash
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Hisobot
          </Button>
        </div>
      </div>

      {/* Tax Rates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Soliq stavkalari</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Daromad solig'i</p>
                <p className="text-2xl font-bold">{taxRates.incomeTax}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Ijtimoiy soliq</p>
                <p className="text-2xl font-bold">{taxRates.socialTax}%</p>
              </div>
              <Percent className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Pensiya jamg'armasi</p>
                <p className="text-2xl font-bold">{taxRates.pensionFund}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami daromad</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(totalGross)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daromad solig'i</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalIncomeTax)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ijtimoiy soliq</CardTitle>
            <Percent className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(totalSocialTax)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pensiya ajratmalari</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalPension)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami soliqlar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">{formatCurrency(totalTaxes)}</div>
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
                placeholder="Xodim ismi bo'yicha qidirish..."
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
                { value: "paid", label: "To'langan" },
                { value: "pending", label: "Kutilmoqda" },
                { value: "overdue", label: "Muddati o'tgan" },
              ]}
              className="w-[180px]"
            />
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tax Records Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Xodim</TableHead>
                <TableHead>Brutto ish haqi</TableHead>
                <TableHead>Daromad solig'i (15%)</TableHead>
                <TableHead>Ijtimoiy soliq (5%)</TableHead>
                <TableHead>Pensiya (2%)</TableHead>
                <TableHead>Jami soliqlar</TableHead>
                <TableHead>To'lanadigan</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.employeeName}</TableCell>
                  <TableCell>{formatCurrency(record.grossSalary)}</TableCell>
                  <TableCell className="text-red-600">-{formatCurrency(record.incomeTax)}</TableCell>
                  <TableCell className="text-blue-600">-{formatCurrency(record.socialTax)}</TableCell>
                  <TableCell className="text-green-600">-{formatCurrency(record.pensionFund)}</TableCell>
                  <TableCell className="font-bold text-purple-600">
                    -{formatCurrency(record.totalTax)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(record.netSalary)}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Oylik hisobot</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-600">To'langan soliqlar</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(paidTaxes)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-600">Kutilayotgan to'lovlar</p>
              <p className="text-2xl font-bold text-yellow-700">{formatCurrency(pendingTaxes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}