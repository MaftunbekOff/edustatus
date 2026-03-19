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
import { Avatar } from "@/components/ui/avatar"
import Link from "next/link"
import {
  Search,
  Users,
  UserPlus,
  FileText,
  Calendar,
  UserCheck,
  Eye,
  Clock,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { HiringModal, FiringModal } from "./components"

// Mock data for employees
const employees = [
  {
    id: "1",
    fullName: "Ahmedov Rustam Toshmatovich",
    department: "Matematika",
    position: "Katta o'qituvchi",
    email: "ahmedov@texnikum.uz",
    status: "active",
    hireDate: "2020-09-01",
    contractType: "muddatli",
    contractEndDate: "2025-08-31",
    salary: 4500000,
  },
  {
    id: "2",
    fullName: "Karimova Dilfuza Bahodirovna",
    department: "Fizika",
    position: "O'qituvchi",
    email: "karimova@texnikum.uz",
    status: "active",
    hireDate: "2021-02-15",
    contractType: "muddatsiz",
    contractEndDate: null,
    salary: 3800000,
  },
  {
    id: "3",
    fullName: "Valiyev Bobur Rahimovich",
    department: "Informatika",
    position: "Kafedra mudiri",
    email: "valiyev@texnikum.uz",
    status: "active",
    hireDate: "2018-08-20",
    contractType: "muddatsiz",
    contractEndDate: null,
    salary: 5200000,
  },
  {
    id: "4",
    fullName: "Najimova Nigora Karimovna",
    department: "Tibbiyot",
    position: "Katta o'qituvchi",
    email: "najimova@texnikum.uz",
    status: "vacation",
    hireDate: "2019-01-10",
    contractType: "muddatli",
    contractEndDate: "2024-01-09",
    salary: 4100000,
  },
]

const departments = ["Matematika", "Fizika", "Informatika", "Tibbiyot", "Kimyo", "Ma'muriyat"]

export default function HRPage() {
  const [search, setSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false)
  const [isFiringModalOpen, setIsFiringModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<typeof employees[0] | null>(null)

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.fullName.toLowerCase().includes(search.toLowerCase()) ||
      employee.email.toLowerCase().includes(search.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Faol</Badge>
      case "vacation":
        return <Badge variant="warning">Ta'tilda</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getContractBadge = (type: string) => {
    switch (type) {
      case "muddatli":
        return <Badge variant="outline" className="border-blue-500 text-blue-500">Muddatli</Badge>
      case "muddatsiz":
        return <Badge variant="outline" className="border-green-500 text-green-500">Muddatsiz</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const totalEmployees = employees.length
  const activeEmployees = employees.filter(e => e.status === "active").length
  const onVacation = employees.filter(e => e.status === "vacation").length
  const totalSalary = employees.reduce((sum, e) => sum + e.salary, 0)

  const handleHiringSubmit = (data: unknown) => {
    // TODO: Implement API call for hiring
    setIsHiringModalOpen(false)
  }

  const handleFiringSubmit = (data: unknown) => {
    // TODO: Implement API call for firing
    setIsFiringModalOpen(false)
  }

  const openFiringModal = (employee: typeof employees[0]) => {
    setSelectedEmployee(employee)
    setIsFiringModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kadrlar bo'limi</h1>
          <p className="text-muted-foreground">Xodimlar ro'yxati</p>
        </div>
        <Button onClick={() => setIsHiringModalOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Ishga qabul qilish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami xodimlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faol xodimlar</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEmployees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ta'tilda</CardTitle>
            <Calendar className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{onVacation}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oylik fond</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {formatCurrency(totalSalary)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/hr/contracts" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Shartnomalar</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/hr/vacations" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-green-600" />
                <span className="font-medium">Ta'tillar</span>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/hr/attendance" className="block">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-purple-600" />
                <span className="font-medium">Davomat</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Ism yoki email bo'yicha qidirish..."
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
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>F.I.O.</TableHead>
                <TableHead>Bo'lim</TableHead>
                <TableHead>Lavozim</TableHead>
                <TableHead>Shartnoma</TableHead>
                <TableHead>Oylik</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar name={employee.fullName} size="sm" />
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{employee.department}</Badge>
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{getContractBadge(employee.contractType)}</TableCell>
                  <TableCell className="font-medium text-green-600">
                    {formatCurrency(employee.salary)}
                  </TableCell>
                  <TableCell>{getStatusBadge(employee.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/hr/${employee.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Hiring Modal */}
      <HiringModal
        isOpen={isHiringModalOpen}
        onClose={() => setIsHiringModalOpen(false)}
        onSubmit={handleHiringSubmit}
      />

      {/* Firing Modal */}
      <FiringModal
        isOpen={isFiringModalOpen}
        onClose={() => setIsFiringModalOpen(false)}
        onSubmit={handleFiringSubmit}
        employee={selectedEmployee ? {
          id: selectedEmployee.id,
          fullName: selectedEmployee.fullName,
          position: selectedEmployee.position,
          department: selectedEmployee.department,
          salary: selectedEmployee.salary,
          hireDate: selectedEmployee.hireDate,
          contractEndDate: selectedEmployee.contractEndDate || undefined,
        } : null}
      />
    </div>
  )
}
