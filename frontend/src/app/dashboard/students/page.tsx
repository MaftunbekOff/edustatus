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
  Filter,
  Download,
  Users,
  UserPlus,
  GraduationCap,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data
const students = [
  {
    id: "1",
    fullName: "Aliyev Anvar Abdullaevich",
    pinfl: "12345678901234",
    group: "101-A",
    phone: "+998901234567",
    balance: 1500000,
    status: "active",
    contractAmount: 12000000,
  },
  {
    id: "2",
    fullName: "Valiyeva Dilnoza Karimovna",
    pinfl: "23456789012345",
    group: "102-B",
    phone: "+998902345678",
    balance: -500000,
    status: "debt",
    contractAmount: 12000000,
  },
  {
    id: "3",
    fullName: "Karimov Bobur Rahimovich",
    pinfl: "34567890123456",
    group: "101-A",
    phone: "+998903456789",
    balance: 0,
    status: "active",
    contractAmount: 12000000,
  },
  {
    id: "4",
    fullName: "Najimova Nigora Bahodirovna",
    pinfl: "45678901234567",
    group: "103-V",
    phone: "+998904567890",
    balance: -2500000,
    status: "debt",
    contractAmount: 15000000,
  },
  {
    id: "5",
    fullName: "Rahimov Jahongir Toshmatovich",
    pinfl: "56789012345678",
    group: "102-B",
    phone: "+998905678901",
    balance: 2000000,
    status: "active",
    contractAmount: 12000000,
  },
]

const groups = ["101-A", "102-B", "103-V", "104-G", "105-D"]

export default function StudentsPage() {
  const [search, setSearch] = useState("")
  const [groupFilter, setGroupFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredStudents = students.filter((student) => {
    const matchesSearch = student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.pinfl.includes(search)
    const matchesGroup = groupFilter === "all" || student.group === groupFilter
    const matchesStatus = statusFilter === "all" || student.status === statusFilter
    return matchesSearch && matchesGroup && matchesStatus
  })

  const getStatusBadge = (status: string, balance: number) => {
    if (status === "debt" || balance < 0) {
      return <Badge variant="error">Qarzdor</Badge>
    }
    return <Badge variant="success">Faol</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Talabalar</h1>
          <p className="text-muted-foreground">
            Barcha talabalar ro'yxati va ularning to'lov holati
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Talaba qo'shish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami talabalar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">320</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol talabalar</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">298</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qarzdorlar</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">22</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami qarzdorlik</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(125000000)}
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
                placeholder="Ism yoki PINFL bo'yicha qidirish..."
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
                ...groups.map((g) => ({ value: g, label: g })),
              ]}
              className="w-[150px]"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha statuslar" },
                { value: "active", label: "Faol" },
                { value: "debt", label: "Qarzdor" },
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

      {/* Students Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>F.I.O.</TableHead>
                <TableHead>PINFL</TableHead>
                <TableHead>Guruh</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Shartnoma</TableHead>
                <TableHead>Balans</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.fullName}</TableCell>
                  <TableCell className="font-mono text-sm">{student.pinfl}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{student.group}</Badge>
                  </TableCell>
                  <TableCell>{student.phone}</TableCell>
                  <TableCell>{formatCurrency(student.contractAmount)}</TableCell>
                  <TableCell className={student.balance < 0 ? "text-red-600 font-semibold" : ""}>
                    {formatCurrency(student.balance)}
                  </TableCell>
                  <TableCell>{getStatusBadge(student.status, student.balance)}</TableCell>
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
