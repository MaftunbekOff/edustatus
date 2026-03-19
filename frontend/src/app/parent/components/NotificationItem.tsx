"use client"

import { CreditCard, TrendingUp, CheckCircle } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Notification {
  id: string
  type: "payment" | "grade" | "attendance"
  message: string
  date: string
  isRead: boolean
}

interface NotificationItemProps {
  notification: Notification
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case "payment":
        return <CreditCard className="h-4 w-4 text-yellow-600" />
      case "grade":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "attendance":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
    }
  }

  const getIconBgColor = () => {
    switch (notification.type) {
      case "payment":
        return "bg-yellow-100"
      case "grade":
        return "bg-green-100"
      case "attendance":
        return "bg-blue-100"
    }
  }

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg ${
        notification.isRead ? "bg-gray-50" : "bg-blue-50 border border-blue-200"
      }`}
    >
      <div className={`flex h-8 w-8 items-center justify-center rounded-full ${getIconBgColor()}`}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{notification.message}</p>
        <p className="text-xs text-muted-foreground">{formatDate(notification.date)}</p>
      </div>
      {!notification.isRead && (
        <span className="h-2 w-2 rounded-full bg-blue-500" />
      )}
    </div>
  )
}