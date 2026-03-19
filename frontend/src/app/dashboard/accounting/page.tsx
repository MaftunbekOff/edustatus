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
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  FileText,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data for salary calculations
const salaryCalculations = [
  {
    id: "1",
    employeeName: "Ahmedov Rustam Toshmatovich",
    department: "Matematika",
    position: "Katta o'qituvchi",
    baseSalary: 4500000,
    workedDays: 22,
    bonus: 500000,
    deductions: 675000,
    netSalary: 4325000,
    status: "paid",
    month: "2024-06",
  },
  {
    id: "2",
    employeeName: "Karimova Dilfuza Bahodirovna",
    department: "Fizika",
    position: "O'qituvchi",
    baseSalary: 3800000,
    workedDays: 22,
    bonus: 300000,
    deductions: 570000,
    netSalary: 3530000,
    status: "pending",
    month: "2024-06",
  },
  {
    id: "3",
    employeeName: "Valiyev Bobur Rahimovich",
    department: "Informatika",
    position: "Kafedra mudiri",
    baseSalary: 5200000,
    workedDays: 22,
    bonus: 800000,
    deductions: 780000,
    netSalary: 5220000,
    status: "paid",
    month: "2024-06",
  },
  {
    id: "4",
    employeeName: "Najimova Nigora Karimovna",
    department: "Tibbiyot",
    position: "Katta o'qituvchi",
    baseSalary: 4100000,
    workedDays: 15,
    bonus: 0,
    deductions: 615000,
    netSalary: 3485000,
    status: "pending",
    month: "2024-06",
  },
  {
    id: "5",
    employeeName: "Rahimov Jahongir Toshmatovich",
    department: "Kimyo",
    position: "O'qituvchi",
    baseSalary: 3600000,
    workedDays: 22,
    bonus: 200000,
    deductions: 540000,
    netSalary: 3260000,
    status: "paid",
    month: "2024-06",
  },
  {
    id: "6",
    employeeName: "Usmonova Gulnora Abdullaevna",
    department: "Ma'muriyat",
    position: "Buxgalter",
    baseSalary: 4000000,
    workedDays: 22,
    bonus: 400000,
    deductions: 600000,
    netSalary: 3800000,
    status: "paid",
    month: "2024-06",
  },
]

export default function AccountingPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [departmentFilter, setDepartmentFilter] = useState("all")

  const filteredSalaries = salaryCalculations.filter((salary) => {
    const matchesSearch = salary.employeeName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || salary.status === statusFilter
    const matchesDepartment = departmentFilter === "all" || salary.department === departmentFilter
    return matchesSearch && matchesStatus && matchesDepartment
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">To'langan</Badge>
      case "pending":
        return <Badge variant="warning">Kutilmoqda</Badge>
      case "cancelled":
        return <Badge variant="error">Bekor qilingan</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  // Calculate statistics
  const totalSalaryFund = salaryCalculations.reduce((sum, s) => sum + s.baseSalary, 0)
  const totalBonuses = salaryCalculations.reduce((sum, s) => sum + s.bonus, 0)
  const totalDeductions = salaryCalculations.reduce((sum, s) => sum + s.deductions, 0)
  const totalNetSalary = salaryCalculations.reduce((sum, s) => sum + s.netSalary, 0)
  const paidAmount = salaryCalculations.filter(s => s.status === "paid").reduce((sum, s) => sum + s.netSalary, 0)
  const pendingAmount = salaryCalculations.filter(s => s.status === "pending").reduce((sum, s) => sum + s.netSalary, 0)

  const departments = ["Matematika", "Fizika", "Informatika", "Tibbiyot", "Kimyo", "Biologiya", "Til", "Ma'muriyat"]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buxgalteriya</h1>
          <p className="text-muted-foreground">
            Ish haqi hisoblash, soliqlar va hisob-kitoblar
          </p>
        </div>
        <Button>
          <Calculator className="mr-2 h-4 w-4" />
          Ish haqini hisoblash
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ish haqi fondi</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatCurrency(totalSalaryFund)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami bonuslar</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(totalBonuses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Soliqlar</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatCurrency(totalDeductions)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To'langan</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
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
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha bo'limlar" },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
              className="w-[180px]"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha statuslar" },
                { value: "paid", label: "To'langan" },
                { value: "pending", label: "Kutilmoqda" },
                { value: "cancelled", label: "Bekor qilingan" },
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

      {/* Salary Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Xodim</TableHead>
                <TableHead>Lavozim</TableHead>
                <TableHead>Asosiy ish haqi</TableHead>
                <TableHead>Ish kunlari</TableHead>
                <TableHead>Bonus</TableHead>
                <TableHead>Soliqlar</TableHead>
                <TableHead>To'lanadigan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSalaries.map((salary) => (
                <TableRow key={salary.id}>
                  <TableCell className="font-medium">{salary.employeeName}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{salary.position}</span>
                      <span className="text-xs text-muted-foreground">{salary.department}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(salary.baseSalary)}</TableCell>
                  <TableCell>{salary.workedDays} kun</TableCell>
                  <TableCell className="text-green-600">
                    {salary.bonus > 0 ? `+${formatCurrency(salary.bonus)}` : "-"}
                  </TableCell>
                  <TableCell className="text-red-600">
                    -{formatCurrency(salary.deductions)}
                  </TableCell>
                  <TableCell className="font-bold text-green-600">
                    {formatCurrency(salary.netSalary)}
                  </TableCell>
                  <TableCell>{getStatusBadge(salary.status)}</TableCell>
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