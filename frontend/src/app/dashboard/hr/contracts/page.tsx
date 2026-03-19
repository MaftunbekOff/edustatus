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
import Link from "next/link"
import {
  Search,
  Plus,
  Download,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowLeft,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data for contracts
const contracts = [
  {
    id: "1",
    employeeName: "Ahmedov Rustam Toshmatovich",
    contractNumber: "SH-2024-001",
    contractType: "muddatli",
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    salary: 4500000,
    status: "active",
    position: "Katta o'qituvchi",
    department: "Matematika",
  },
  {
    id: "2",
    employeeName: "Karimova Dilfuza Bahodirovna",
    contractNumber: "SH-2024-002",
    contractType: "muddatsiz",
    startDate: "2021-02-15",
    endDate: null,
    salary: 3800000,
    status: "active",
    position: "O'qituvchi",
    department: "Fizika",
  },
  {
    id: "3",
    employeeName: "Valiyev Bobur Rahimovich",
    contractNumber: "SH-2024-003",
    contractType: "muddatsiz",
    startDate: "2018-08-20",
    endDate: null,
    salary: 5200000,
    status: "active",
    position: "Kafedra mudiri",
    department: "Informatika",
  },
  {
    id: "4",
    employeeName: "Najimova Nigora Karimovna",
    contractNumber: "SH-2024-004",
    contractType: "muddatli",
    startDate: "2024-01-10",
    endDate: "2024-01-09",
    salary: 4100000,
    status: "expiring",
    position: "Katta o'qituvchi",
    department: "Tibbiyot",
  },
  {
    id: "5",
    employeeName: "Rahimov Jahongir Toshmatovich",
    contractNumber: "SH-2024-005",
    contractType: "muddatli",
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    salary: 3600000,
    status: "active",
    position: "O'qituvchi",
    department: "Kimyo",
  },
  {
    id: "6",
    employeeName: "Usmonova Gulnora Abdullaevna",
    contractNumber: "SH-2024-006",
    contractType: "muddatsiz",
    startDate: "2017-03-15",
    endDate: null,
    salary: 4000000,
    status: "active",
    position: "Buxgalter",
    department: "Ma'muriyat",
  },
]

export default function ContractsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch = contract.employeeName.toLowerCase().includes(search.toLowerCase()) ||
      contract.contractNumber.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter
    const matchesType = typeFilter === "all" || contract.contractType === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Faol</Badge>
      case "expiring":
        return <Badge variant="warning">Tugayotgan</Badge>
      case "expired":
        return <Badge variant="error">Tugagan</Badge>
      case "terminated":
        return <Badge variant="error">Bekor qilingan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "muddatli":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Muddatli</Badge>
      case "muddatsiz":
        return <Badge variant="outline" className="border-green-500 text-green-500">Muddatsiz</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  // Calculate statistics
  const totalContracts = contracts.length
  const activeContracts = contracts.filter(c => c.status === "active").length
  const expiringContracts = contracts.filter(c => c.status === "expiring").length
  const expiredContracts = contracts.filter(c => c.status === "expired" || c.status === "terminated").length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/hr">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Mehnat shartnomalari</h1>
            <p className="text-muted-foreground">
              Barcha mehnat shartnomalari ro'yxati
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Shartnoma qo'shish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami shartnomalar</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol shartnomalar</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugayotgan shartnomalar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{expiringContracts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tugagan/Bekor qilingan</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{expiredContracts}</div>
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
                placeholder="Ism yoki shartnoma raqami bo'yicha qidirish..."
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
                { value: "active", label: "Faol" },
                { value: "expiring", label: "Tugayotgan" },
                { value: "expired", label: "Tugagan" },
                { value: "terminated", label: "Bekor qilingan" },
              ]}
              className="w-[180px]"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha turlari" },
                { value: "muddatli", label: "Muddatli" },
                { value: "muddatsiz", label: "Muddatsiz" },
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

      {/* Contracts Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Shartnoma raqami</TableHead>
                <TableHead>Xodim</TableHead>
                <TableHead>Lavozim</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Boshlanish</TableHead>
                <TableHead>Tugash</TableHead>
                <TableHead>Oylik</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-mono font-medium">{contract.contractNumber}</TableCell>
                  <TableCell className="font-medium">{contract.employeeName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{contract.position}</span>
                      <span className="text-xs text-muted-foreground">{contract.department}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(contract.contractType)}</TableCell>
                  <TableCell>
                    {new Date(contract.startDate).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell>
                    {contract.endDate ? (
                      new Date(contract.endDate).toLocaleDateString('uz-UZ')
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(contract.salary)}
                  </TableCell>
                  <TableCell>{getStatusBadge(contract.status)}</TableCell>
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