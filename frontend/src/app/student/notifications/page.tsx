"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Info,
  Calendar,
  CreditCard,
  Settings,
  Trash2,
} from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import Link from "next/link"

// Mock notifications
const notifications = [
  {
    id: "1",
    type: "payment_reminder",
    title: "To'lov eslatmasi",
    message: "Shartnoma to'lovi uchun 1,500,000 so'm qarzdorlik mavjud. Iltimos, o'z vaqtida to'lang.",
    date: "2025-02-13",
    isRead: false,
    icon: CreditCard,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
  },
  {
    id: "2",
    type: "deadline",
    title: "To'lov muddati yaqinlashmoqda",
    message: "2024-2025 o'quv yili 2-semestr to'lovi uchun muddat 2025-02-28 da tugaydi.",
    date: "2025-02-10",
    isRead: false,
    icon: Calendar,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
  },
  {
    id: "3",
    type: "success",
    title: "To'lov qabul qilindi",
    message: "1,500,000 so'm miqdoridagi to'lovingiz muvaffaqiyatli qabul qilindi.",
    date: "2025-01-15",
    isRead: true,
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    id: "4",
    type: "info",
    title: "Yangi imkoniyat",
    message: "Endi Click, Payme va Uzum Bank orqali onlayn to'lov qilishingiz mumkin.",
    date: "2025-01-10",
    isRead: true,
    icon: Info,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    id: "5",
    type: "success",
    title: "To'lov qabul qilindi",
    message: "1,000,000 so'm miqdoridagi to'lovingiz muvaffaqiyatli qabul qilindi.",
    date: "2024-12-10",
    isRead: true,
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
  {
    id: "6",
    type: "success",
    title: "To'lov qabul qilindi",
    message: "1,000,000 so'm miqdoridagi to'lovingiz muvaffaqiyatli qabul qilindi.",
    date: "2024-11-05",
    isRead: true,
    icon: CheckCircle,
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
  },
]

export default function StudentNotificationsPage() {
  const [notificationList, setNotificationList] = React.useState(notifications)

  const unreadCount = notificationList.filter((n) => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotificationList((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotificationList((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const deleteNotification = (id: string) => {
    setNotificationList((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-green-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/student" className="flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-semibold">Bildirishnomalar</h1>
                <p className="text-sm text-white/80">
                  {unreadCount > 0 ? `${unreadCount} ta o'qilmagan` : "Barchasi o'qilgan"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                onClick={markAllAsRead}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Hammasini o'qilgan qilish
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Notification Settings */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Bildirishnoma sozlamalari</p>
                  <p className="text-sm text-muted-foreground">
                    SMS va Email bildirishnomalarni boshqarish
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Sozlash
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {notificationList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">Bildirishnomalar yo'q</p>
                <p className="text-sm text-muted-foreground">
                  Hozircha bildirishnomalar mavjud emas
                </p>
              </CardContent>
            </Card>
          ) : (
            notificationList.map((notification) => (
              <Card
                key={notification.id}
                className={`${!notification.isRead ? "border-l-4 border-l-green-500 bg-green-50/50" : ""}`}
              >
                <CardContent className="pt-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.iconBg}`}
                    >
                      <notification.icon className={`h-5 w-5 ${notification.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{notification.title}</p>
                            {!notification.isRead && (
                              <Badge variant="success" className="text-xs">
                                Yangi
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDate(notification.date)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">Tezkor amallar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Link href="/student/payment">
                <Button variant="outline" className="w-full h-auto py-4">
                  <div className="text-center">
                    <CreditCard className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">To'lov qilish</p>
                  </div>
                </Button>
              </Link>
              <Link href="/student">
                <Button variant="outline" className="w-full h-auto py-4">
                  <div className="text-center">
                    <Calendar className="h-6 w-6 mx-auto mb-2" />
                    <p className="font-medium">To'lov tarixi</p>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2025 Tibbiyot Texnikumi. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  )
}
