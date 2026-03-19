"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  QrCode,
  Camera,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
} from "lucide-react"
import { formatDate } from "@/lib/utils"

// Mock data
const todayAttendance = [
  { id: "1", studentName: "Aliyev Anvar", group: "101-A", time: "08:15", status: "present" },
  { id: "2", studentName: "Valiyeva Dilnoza", group: "102-B", time: "08:20", status: "present" },
  { id: "3", studentName: "Karimov Bobur", group: "101-A", time: "08:45", status: "late" },
  { id: "4", studentName: "Najimova Nigora", group: "103-V", time: null, status: "absent" },
  { id: "5", studentName: "Rahimov Jahongir", group: "102-B", time: "08:10", status: "present" },
]

const attendanceStats = {
  total: 320,
  present: 298,
  late: 12,
  absent: 10,
}

export default function AttendancePage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="success">Keldi</Badge>
      case "late":
        return <Badge variant="warning">Kechikdi</Badge>
      case "absent":
        return <Badge variant="error">Kelmadi</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Davomat</h1>
          <p className="text-muted-foreground">
            QR-kod orqali davomatni boshqarish
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Hisobot
          </Button>
          <Button>
            <QrCode className="mr-2 h-4 w-4" />
            QR Skaner
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jami talabalar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{attendanceStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keldi</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{attendanceStats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kechikdi</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{attendanceStats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kelmadi</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{attendanceStats.absent}</div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Scanner Card */}
      <Card className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                <QrCode className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold">QR-Kod bilan davomat</h3>
                <p className="text-white/80">
              Talabalar QR-kod skanerdan o'tib davomatni belgilashlari mumkin
                </p>
              </div>
            </div>
            <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90">
              <Camera className="mr-2 h-5 w-5" />
              Skanerni ochish
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>Bugungi davomat - {formatDate(new Date().toISOString())}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talaba</TableHead>
                <TableHead>Guruh</TableHead>
                <TableHead>Vaqt</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todayAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.studentName}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{record.group}</Badge>
                  </TableCell>
                  <TableCell>{record.time || "-"}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
