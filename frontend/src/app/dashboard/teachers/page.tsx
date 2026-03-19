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
  Users,
  UserCheck,
  BookOpen,
  Mail,
  Phone,
  Wallet,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data
const teachers = [
  {
    id: "1",
    fullName: "Ahmedov Rustam Toshmatovich",
    pinfl: "12345678901234",
    department: "Matematika",
    position: "Katta o'qituvchi",
    phone: "+998901234567",
    email: "ahmedov@texnikum.uz",
    status: "active",
    subjects: ["Matematika", "Statistika"],
    groups: ["101-A", "102-B"],
    salary: 4500000,
    workedHours: 72,
    hourlyRate: 62500,
  },
  {
    id: "2",
    fullName: "Karimova Dilfuza Bahodirovna",
    pinfl: "23456789012345",
    department: "Fizika",
    position: "O'qituvchi",
    phone: "+998902345678",
    email: "karimova@texnikum.uz",
    status: "active",
    subjects: ["Fizika", "Astronomiya"],
    groups: ["103-V", "104-G"],
    salary: 3800000,
    workedHours: 64,
    hourlyRate: 59375,
  },
  {
    id: "3",
    fullName: "Valiyev Bobur Rahimovich",
    pinfl: "34567890123456",
    department: "Informatika",
    position: "Kafedra mudiri",
    phone: "+998903456789",
    email: "valiyev@texnikum.uz",
    status: "active",
    subjects: ["Dasturlash", "Ma'lumotlar bazasi"],
    groups: ["101-A", "105-D"],
    salary: 5200000,
    workedHours: 80,
    hourlyRate: 65000,
  },
  {
    id: "4",
    fullName: "Najimova Nigora Karimovna",
    pinfl: "45678901234567",
    department: "Tibbiyot",
    position: "Katta o'qituvchi",
    phone: "+998904567890",
    email: "najimova@texnikum.uz",
    status: "vacation",
    subjects: ["Anatomiya", "Fiziologiya"],
    groups: ["102-B", "103-V"],
    salary: 4100000,
    workedHours: 48,
    hourlyRate: 85417,
  },
  {
    id: "5",
    fullName: "Rahimov Jahongir Toshmatovich",
    pinfl: "56789012345678",
    department: "Kimyo",
    position: "O'qituvchi",
    phone: "+998905678901",
    email: "rahimov@texnikum.uz",
    status: "active",
    subjects: ["Umumiy kimyo", "Organik kimyo"],
    groups: ["104-G", "105-D"],
    salary: 3600000,
    workedHours: 60,
    hourlyRate: 60000,
  },
]

const departments = ["Matematika", "Fizika", "Informatika", "Tibbiyot", "Kimyo", "Biologiya", "Til"]

export default function TeachersPage() {
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.fullName.toLowerCase().includes(search.toLowerCase()) ||
      teacher.pinfl.includes(search) ||
      teacher.email.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || teacher.department === departmentFilter
    const matchesStatus = statusFilter === "all" || teacher.status === statusFilter
    return matchesSearch && matchesDepartment && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Faol</Badge>
      case "vacation":
        return <Badge variant="warning">Ta'tilda</Badge>
      case "inactive":
        return <Badge variant="error">Nofaol</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">O'qituvchilar</h1>
          <p className="text-muted-foreground">
            Barcha o'qituvchilar ro'yxati va ularning ma'lumotlari. Yangi o'qituvchi qo'shish uchun Kadrlar bo'limiga o'ting.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami o'qituvchilar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol o'qituvchilar</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">42</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kafedralar</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">7</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oylik ish haqi</CardTitle>
            <Wallet className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(teachers.reduce((sum, t) => sum + t.salary, 0))}
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
                placeholder="Ism, PINFL yoki email bo'yicha qidirish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha kafedralar" },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
              className="w-[180px]"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "Barcha statuslar" },
                { value: "active", label: "Faol" },
                { value: "vacation", label: "Ta'tilda" },
                { value: "inactive", label: "Nofaol" },
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

      {/* Teachers Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>F.I.O.</TableHead>
                <TableHead>Kafedra</TableHead>
                <TableHead>Lavozim</TableHead>
                <TableHead>Fanlar</TableHead>
                <TableHead>Ish soati</TableHead>
                <TableHead>Oylik ish haqi</TableHead>
                <TableHead>Aloqa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">{teacher.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{teacher.department}</Badge>
                  </TableCell>
                  <TableCell>{teacher.position}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{teacher.workedHours} soat</div>
                      <div className="text-muted-foreground">
                        {formatCurrency(teacher.hourlyRate)}/soat
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      {formatCurrency(teacher.salary)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {teacher.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {teacher.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(teacher.status)}</TableCell>
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