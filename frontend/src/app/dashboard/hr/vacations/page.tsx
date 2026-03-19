"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select } from "@/components/ui/select"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, ArrowLeft, Calendar, CheckCircle, Clock } from "lucide-react"

const vacations = [
  { id: "1", employeeName: "Ahmedov Rustam", type: "Yillik", startDate: "2024-07-01", endDate: "2024-07-28", days: 28, status: "approved" },
  { id: "2", employeeName: "Karimova Dilfuza", type: "Yillik", startDate: "2024-08-01", endDate: "2024-08-21", days: 21, status: "pending" },
  { id: "3", employeeName: "Valiyev Bobur", type: "Kasallik", startDate: "2024-06-15", endDate: "2024-06-20", days: 5, status: "approved" },
]

export default function VacationsPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredVacations = vacations.filter((v) => {
    const matchesSearch = v.employeeName.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || v.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="success">Tasdiqlangan</Badge>
      case "pending":
        return <Badge variant="warning">Kutilmoqda</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/hr">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Orqaga
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Ta'tillar</h1>
          <p className="text-muted-foreground">Ta'til arizalari</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami arizalar</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{vacations.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasdiqlangan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{vacations.filter(v => v.status === "approved").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{vacations.filter(v => v.status === "pending").length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Qidirish..."
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
                { value: "approved", label: "Tasdiqlangan" },
                { value: "pending", label: "Kutilmoqda" },
              ]}
              className="w-[180px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Xodim</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Boshlanish</TableHead>
                <TableHead>Tugash</TableHead>
                <TableHead>Kunlar</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVacations.map((vacation) => (
                <TableRow key={vacation.id}>
                  <TableCell className="font-medium">{vacation.employeeName}</TableCell>
                  <TableCell>{vacation.type}</TableCell>
                  <TableCell>{new Date(vacation.startDate).toLocaleDateString('uz-UZ')}</TableCell>
                  <TableCell>{new Date(vacation.endDate).toLocaleDateString('uz-UZ')}</TableCell>
                  <TableCell>{vacation.days} kun</TableCell>
                  <TableCell>{getStatusBadge(vacation.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
