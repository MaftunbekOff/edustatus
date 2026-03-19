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
  AlertTriangle,
  Phone,
  MessageSquare,
  Send,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data
const debtors = [
  {
    id: "1",
    fullName: "Karimov Kamol Abdullaevich",
    group: "101-A",
    phone: "+998901234567",
    totalDebt: 4500000,
    months: 3,
    lastPayment: "2024-10-15",
  },
  {
    id: "2",
    fullName: "Rahimov Rustam Toshmatovich",
    group: "102-B",
    phone: "+998902345678",
    totalDebt: 3800000,
    months: 2,
    lastPayment: "2024-11-01",
  },
  {
    id: "3",
    fullName: "Najimov Nodir Bahodirovich",
    group: "101-A",
    phone: "+998903456789",
    totalDebt: 2500000,
    months: 2,
    lastPayment: "2024-11-10",
  },
  {
    id: "4",
    fullName: "Sattorova Sevara Karimovna",
    group: "103-V",
    phone: "+998904567890",
    totalDebt: 2200000,
    months: 1,
    lastPayment: "2024-12-01",
  },
  {
    id: "5",
    fullName: "Aliyev Anvar Soliyevich",
    group: "104-G",
    phone: "+998905678901",
    totalDebt: 6000000,
    months: 4,
    lastPayment: "2024-09-15",
  },
]

export default function DebtorsPage() {
  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState("all")

  const filteredDebtors = debtors.filter((debtor) => {
    const matchesSearch = debtor.fullName.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = groupFilter === "all" || debtor.group === groupFilter
    return matchesSearch && matchesGroup
  })

  const totalDebt = filteredDebtors.reduce((sum, d) => sum + d.totalDebt, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Qarzdorlar</h1>
          <p className="text-muted-foreground">To'lov qarzdorlari ro'yxati</p>
        </div>
        <Button variant="outline">
          <Send className="mr-2 h-4 w-4" />
          Hammaga eslatma yuborish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami qarzdorlar</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{debtors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami qarzdorlik</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalDebt)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">O'rtacha qarz</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(totalDebt / debtors.length)}
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
                placeholder="Ism bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha guruhlar" },
                { value: "101-A", label: "101-A" },
                { value: "102-B", label: "102-B" },
                { value: "103-V", label: "103-V" },
                { value: "104-G", label: "104-G" },
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

      {/* Debtors Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>F.I.O.</TableHead>
                <TableHead>Guruh</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Qarz miqdori</TableHead>
                <TableHead>Oylar</TableHead>
                <TableHead>So'nggi to'lov</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDebtors.map((debtor) => (
                <TableRow key={debtor.id}>
                  <TableCell className="font-medium">{debtor.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{debtor.group}</Badge>
                  </TableCell>
                  <TableCell>{debtor.phone}</TableCell>
                  <TableCell className="text-red-600 font-semibold">
                    {formatCurrency(debtor.totalDebt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="error">{debtor.months} oy</Badge>
                  </TableCell>
                  <TableCell>{debtor.lastPayment}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="h-4 w-4" />
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
