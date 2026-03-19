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
  Bell,
  MessageSquare,
  Smartphone,
  Send,
  Clock,
  CheckCircle,
  Settings,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data
const reminders = [
  {
    id: "1",
    studentName: "Karimov Kamol",
    phone: "+998901234567",
    message: "Hurmatli ota-ona, 4500000 so'm qarzdorlik mavjud...",
    type: "sms",
    status: "sent",
    sentAt: "2025-01-15 10:30",
    debt: 4500000,
  },
  {
    id: "2",
    studentName: "Rahimov Rustam",
    phone: "+998902345678",
    message: "Hurmatli ota-ona, 3800000 so'm qarzdorlik mavjud...",
    type: "telegram",
    status: "delivered",
    sentAt: "2025-01-15 10:25",
    debt: 3800000,
  },
  {
    id: "3",
    studentName: "Najimov Nodir",
    phone: "+998903456789",
    message: "Hurmatli ota-ona, 2500000 so'm qarzdorlik mavjud...",
    type: "sms",
    status: "pending",
    sentAt: null,
    debt: 2500000,
  },
  {
    id: "4",
    studentName: "Sattorova Sevara",
    phone: "+998904567890",
    message: "Hurmatli ota-ona, 2200000 so'm qarzdorlik mavjud...",
    type: "telegram",
    status: "failed",
    sentAt: "2025-01-15 10:20",
    debt: 2200000,
  },
]

const scheduledReminders = [
  { id: "1", name: "Kunlik eslatma", time: "09:00", type: "sms", active: true },
  { id: "2", name: "Haftalik hisobot", time: "Mon 10:00", type: "telegram", active: true },
  { id: "3", name: "Oylik xulosa", time: "1st day 09:00", type: "sms", active: false },
]

export default function RemindersPage() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sent":
        return <Badge variant="secondary">Yuborildi</Badge>
      case "delivered":
        return <Badge variant="success">Yetkazildi</Badge>
      case "pending":
        return <Badge variant="warning">Kutilmoqda</Badge>
      case "failed":
        return <Badge variant="error">Xato</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === "sms" ? (
      <Smartphone className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Eslatmalar</h1>
          <p className="text-muted-foreground">
            SMS va Telegram orqali eslatmalar yuborish
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Sozlamalar
          </Button>
          <Button>
            <Send className="mr-2 h-4 w-4" />
            Hammaga yuborish
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugun yuborildi</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yetkazildi</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">142</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kutilmoqda</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">22</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xato</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Scheduled Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Rejalashtirilgan eslatmalar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div>
                    <p className="font-medium">{reminder.name}</p>
                    <p className="text-sm text-muted-foreground">{reminder.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={reminder.active ? "success" : "secondary"}>
                    {reminder.active ? "Faol" : "Nofaol"}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    Tahrirlash
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>So'nggi eslatmalar</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Talaba</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Xabar</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sana</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reminders.map((reminder) => (
                <TableRow key={reminder.id}>
                  <TableCell className="font-medium">{reminder.studentName}</TableCell>
                  <TableCell>{reminder.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">{reminder.message}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTypeIcon(reminder.type)}
                      <span className="capitalize">{reminder.type}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(reminder.status)}</TableCell>
                  <TableCell>{reminder.sentAt || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
