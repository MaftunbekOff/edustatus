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
  TrendingDown,
  ShoppingCart,
  FileText,
  Building,
  Zap,
  MoreHorizontal,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data for expenses
const expenses = [
  {
    id: "1",
    description: "Elektr energiyasi",
    category: "utilities",
    amount: 2500000,
    date: "2024-06-01",
    status: "paid",
    vendor: "Toshkent Elektr Tarmoqlari",
    invoiceNumber: "INV-2024-001",
  },
  {
    id: "2",
    description: "Suv ta'minoti",
    category: "utilities",
    amount: 450000,
    date: "2024-06-05",
    status: "paid",
    vendor: "Toshkent Suv Ta'minoti",
    invoiceNumber: "INV-2024-002",
  },
  {
    id: "3",
    description: "Gaz ta'minoti",
    category: "utilities",
    amount: 1200000,
    date: "2024-06-10",
    status: "pending",
    vendor: "Hududiy Gaz Tarmoqlari",
    invoiceNumber: "INV-2024-003",
  },
  {
    id: "4",
    description: "Ofis jihozlar",
    category: "equipment",
    amount: 8500000,
    date: "2024-06-15",
    status: "paid",
    vendor: "TechZone LLC",
    invoiceNumber: "INV-2024-004",
  },
  {
    id: "5",
    description: "Ta'mirlash ishlari",
    category: "maintenance",
    amount: 15000000,
    date: "2024-06-20",
    status: "pending",
    vendor: "Qurilish Servis",
    invoiceNumber: "INV-2024-005",
  },
  {
    id: "6",
    description: "Darsliklar va adabiyotlar",
    category: "education",
    amount: 3200000,
    date: "2024-06-25",
    status: "paid",
    vendor: "Kitob Olami",
    invoiceNumber: "INV-2024-006",
  },
  {
    id: "7",
    description: "Internet xizmati",
    category: "utilities",
    amount: 800000,
    date: "2024-06-01",
    status: "paid",
    vendor: "Uztelecom",
    invoiceNumber: "INV-2024-007",
  },
  {
    id: "8",
    description: "Tozalash materiallari",
    category: "maintenance",
    amount: 350000,
    date: "2024-06-28",
    status: "pending",
    vendor: "CleanPro",
    invoiceNumber: "INV-2024-008",
  },
]

const expenseCategories = [
  { value: "utilities", label: "Kommunal xizmatlar" },
  { value: "equipment", label: "Jihozlar" },
  { value: "maintenance", label: "Ta'mirlash" },
  { value: "education", label: "Ta'lim" },
  { value: "salary", label: "Ish haqi" },
  { value: "other", label: "Boshqa" },
]

export default function ExpensesPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(search.toLowerCase()) ||
      expense.vendor.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || expense.status === statusFilter
    const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter
    return matchesSearch && matchesStatus && matchesCategory
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

  const getCategoryBadge = (category: string) => {
    const catInfo = expenseCategories.find(c => c.value === category)
    switch (category) {
      case "utilities":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">{catInfo?.label}</Badge>
      case "equipment":
        return <Badge variant="outline" className="border-purple-500 text-purple-500">{catInfo?.label}</Badge>
      case "maintenance":
        return <Badge variant="outline" className="border-orange-500 text-orange-500">{catInfo?.label}</Badge>
      case "education":
        return <Badge variant="outline" className="border-green-500 text-green-500">{catInfo?.label}</Badge>
      case "salary":
        return <Badge variant="outline" className="border-pink-500 text-pink-500">{catInfo?.label}</Badge>
      default:
        return <Badge variant="outline">{catInfo?.label || category}</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "utilities":
        return <Zap className="h-4 w-4" />
      case "equipment":
        return <ShoppingCart className="h-4 w-4" />
      case "maintenance":
        return <Building className="h-4 w-4" />
      case "education":
        return <FileText className="h-4 w-4" />
      default:
        return <MoreHorizontal className="h-4 w-4" />
    }
  }

  // Calculate statistics
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
  const paidExpenses = expenses.filter(e => e.status === "paid").reduce((sum, e) => sum + e.amount, 0)
  const pendingExpenses = expenses.filter(e => e.status === "pending").reduce((sum, e) => sum + e.amount, 0)
  const utilitiesTotal = expenses.filter(e => e.category === "utilities").reduce((sum, e) => sum + e.amount, 0)
  const thisMonthTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Xarajatlar</h1>
          <p className="text-muted-foreground">
            Tashkilot xarajatlari va byudjet
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Hisobot
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Xarajat qo'shish
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami xarajatlar</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">To'langan</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(paidExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
            <FileText className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kommunal xizmatlar</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatCurrency(utilitiesTotal)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Kategoriya bo'yicha xarajatlar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {expenseCategories.slice(0, 5).map((cat) => {
              const catTotal = expenses
                .filter(e => e.category === cat.value)
                .reduce((sum, e) => sum + e.amount, 0)
              return (
                <div key={cat.value} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="p-2 bg-muted rounded-lg">
                    {getCategoryIcon(cat.value)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{cat.label}</p>
                    <p className="font-bold">{formatCurrency(catTotal)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tavsif yoki yetkazib beruvchi bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha kategoriyalar" },
                ...expenseCategories.map(c => ({ value: c.value, label: c.label })),
              ]}
              className="w-[200px]"
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

      {/* Expenses Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sana</TableHead>
                <TableHead>Tavsif</TableHead>
                <TableHead>Kategoriya</TableHead>
                <TableHead>Yetkazib beruvchi</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Summa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString('uz-UZ')}
                  </TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{getCategoryBadge(expense.category)}</TableCell>
                  <TableCell>{expense.vendor}</TableCell>
                  <TableCell className="font-mono text-sm">{expense.invoiceNumber}</TableCell>
                  <TableCell className="font-bold text-red-600">
                    -{formatCurrency(expense.amount)}
                  </TableCell>
                  <TableCell>{getStatusBadge(expense.status)}</TableCell>
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