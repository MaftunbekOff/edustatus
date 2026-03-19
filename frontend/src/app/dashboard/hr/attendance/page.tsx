"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar } from "@/components/ui/avatar"
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
import {
  Calendar,
  Clock,
  Users,
  UserCheck,
  UserX,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react"

const mockEmployees = [
  { id: "1", fullName: "Ahmedov Rustam", department: "Matematika", position: "O'qituvchi" },
  { id: "2", fullName: "Karimova Dilfuza", department: "Fizika", position: "O'qituvchi" },
  { id: "3", fullName: "Valiyev Bobur", department: "Informatika", position: "Kafedra mudiri" },
  { id: "4", fullName: "Najimova Nigora", department: "Tibbiyot", position: "O'qituvchi" },
]

const statusConfig: { [key: string]: { label: string; color: string } } = {
  present: { label: "Keldi", color: "bg-green-100 text-green-800" },
  absent: { label: "Kelmadi", color: "bg-red-100 text-red-800" },
  late: { label: "Kechikdi", color: "bg-yellow-100 text-yellow-800" },
  vacation: { label: "Ta'til", color: "bg-blue-100 text-blue-800" },
  weekend: { label: "Dam", color: "bg-gray-100 text-gray-600" },
}

const departments = [
  { value: "all", label: "Barcha bo'limlar" },
  { value: "Matematika", label: "Matematika" },
  { value: "Fizika", label: "Fizika" },
  { value: "Informatika", label: "Informatika" },
]

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const today = new Date()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const filteredData = mockEmployees.filter(employee => {
    const matchesSearch = employee.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesDepartment = departmentFilter === "all" || employee.department === departmentFilter
    return matchesSearch && matchesDepartment
  })

  const getMonthName = (date: Date) => {
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"]
    return months[date.getMonth()]
  }

  const getDayOfWeek = (day: number) => {
    const date = new Date(year, month, day)
    const weekdays = ["Ya", "Du", "Se", "Cho", "Pa", "Ju", "Sha"]
    return weekdays[date.getDay()]
  }

  const isWeekend = (day: number) => {
    const date = new Date(year, month, day)
    return date.getDay() === 0 || date.getDay() === 6
  }

  const isToday = (day: number) => {
    return today.getDate() === day && today.getMonth() === month && today.getFullYear() === year
  }

  const getRandomStatus = (day: number) => {
    if (isWeekend(day)) return "weekend"
    if (day > today.getDate()) return null
    const rand = Math.random()
    if (rand > 0.9) return "absent"
    if (rand > 0.8) return "late"
    if (rand > 0.7) return "vacation"
    return "present"
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
          <h1 className="text-2xl font-bold">Davomat</h1>
          <p className="text-muted-foreground">Xodimlar davomati</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami xodimlar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{mockEmployees.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugun keldi</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">3</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelmaganlar</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">1</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ta'tilda</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">0</div></CardContent>
        </Card>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold min-w-[150px] text-center">
                {getMonthName(currentDate)} {year}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Qidirish..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                options={departments}
                className="w-48"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10 min-w-[200px]">Xodim</TableHead>
                {days.slice(0, 15).map(day => (
                  <TableHead
                    key={day}
                    className={`text-center p-2 min-w-[50px] ${isWeekend(day) ? "bg-muted/50" : ""} ${isToday(day) ? "bg-primary/10" : ""}`}
                  >
                    <div className="text-xs text-muted-foreground">{getDayOfWeek(day)}</div>
                    <div className="font-medium">{day}</div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map(employee => (
                <TableRow key={employee.id}>
                  <TableCell className="sticky left-0 bg-background z-10">
                    <div className="flex items-center gap-3">
                      <Avatar name={employee.fullName} size="sm" />
                      <div>
                        <p className="font-medium">{employee.fullName}</p>
                        <p className="text-xs text-muted-foreground">{employee.position}</p>
                      </div>
                    </div>
                  </TableCell>
                  {days.slice(0, 15).map(day => {
                    const status = getRandomStatus(day)
                    const config = status ? statusConfig[status] : null
                    return (
                      <TableCell key={day} className={`p-1 text-center ${isWeekend(day) ? "bg-muted/50" : ""} ${isToday(day) ? "bg-primary/5" : ""}`}>
                        {config && (
                          <div className={`px-2 py-1 rounded text-xs ${config.color}`}>
                            {config.label}
                          </div>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
