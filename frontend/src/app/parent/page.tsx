"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  GraduationCap,
  CreditCard,
  Bell,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  Download,
  MessageSquare,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { ChildCard } from "./components/ChildCard"
import { NotificationItem } from "./components/NotificationItem"
import { useParentData } from "@/lib/hooks/useParentData"

// ==========================================
// HEADER COMPONENT
// ==========================================

interface HeaderProps {
  familyName: string
  unreadCount: number
  onLogout: () => void
}

function Header({ familyName, unreadCount, onLogout }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-semibold">{familyName}</h1>
              <p className="text-sm text-white/80">Yagona Ta'lim Portali</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-white hover:bg-white/20 relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px]">
                  {unreadCount}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              className="text-white hover:bg-white/20"
              onClick={onLogout}
            >
              Chiqish
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

// ==========================================
// WELCOME CARD COMPONENT
// ==========================================

interface WelcomeCardProps {
  parentName: string
  childrenCount: number
  totalPaid: number
  totalDebt: number
}

function WelcomeCard({ parentName, childrenCount, totalPaid, totalDebt }: WelcomeCardProps) {
  return (
    <Card className="mb-6 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-indigo-800">
              Xush kelibsiz, {parentName}!
            </h2>
            <p className="text-indigo-600 mt-1">
              Sizning {childrenCount} ta farzandingiz ro'yxatda turibdi
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jami to'langan</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Jami qarzdorlik</p>
              <p className="text-lg font-bold text-red-600">{formatCurrency(totalDebt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// STATS CARDS COMPONENT
// ==========================================

interface StatsCardsProps {
  childrenCount: number
  activeCount: number
  totalDebt: number
  avgAttendance: number
}

function StatsCards({ childrenCount, activeCount, totalDebt, avgAttendance }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <GraduationCap className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Talabalar</p>
              <p className="text-2xl font-bold">{childrenCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Faol</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Kutilayotgan to'lov</p>
              <p className="text-xl font-bold text-yellow-600">{formatCurrency(totalDebt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">O'rtacha davomat</p>
              <p className="text-2xl font-bold text-purple-600">{avgAttendance}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// QUICK ACTIONS COMPONENT
// ==========================================

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tezkor amallar</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 grid-cols-2">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <CreditCard className="h-6 w-6 text-green-600" />
            <span>To'lov qilish</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Download className="h-6 w-6 text-blue-600" />
            <span>Kvitansiya</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <MessageSquare className="h-6 w-6 text-purple-600" />
            <span>Murojaat</span>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2">
            <Calendar className="h-6 w-6 text-orange-600" />
            <span>Dars jadvali</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// NOTIFICATIONS CARD COMPONENT
// ==========================================

interface NotificationsCardProps {
  notifications: Array<{
    id: string
    type: "payment" | "grade" | "attendance"
    message: string
    date: string
    isRead: boolean
  }>
}

function NotificationsCard({ notifications }: NotificationsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">So'nggi bildirishnomalar</CardTitle>
          <Button variant="ghost" size="sm">
            Barchasi
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// FOOTER COMPONENT
// ==========================================

function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2025 Yagona Ta'lim Portali. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function ParentDashboard() {
  const {
    parent,
    children,
    notifications,
    summary,
    unreadCount,
    logout,
  } = useParentData({ useMock: true })

  // Transform notifications for NotificationItem component
  const transformedNotifications = notifications.map((n) => ({
    id: n.id,
    type: (n.relatedType === "payment" ? "payment" : n.relatedType === "reminder" ? "payment" : "attendance") as "payment" | "grade" | "attendance",
    message: n.message,
    date: n.createdAt,
    isRead: n.isRead,
  }))

  // Transform children for ChildCard component
  const transformedChildren = children.map((child) => ({
    id: child.id,
    fullName: child.fullName,
    pinfl: "00000000000000", // Mock PINFL
    institution: {
      name: child.collegeName,
      type: "texnikum" as const,
      address: "",
    },
    group: child.group,
    specialty: child.specialty,
    contractNumber: child.contractNumber,
    totalAmount: child.payment.totalAmount,
    paidAmount: child.payment.paidAmount,
    debtAmount: child.payment.debtAmount,
    nextPaymentDate: child.payment.nextPaymentDue,
    status: child.status,
    attendance: 95, // Mock attendance
  }))

  const avgAttendance = summary ? summary.averageProgress : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        familyName={parent?.fullName ? `${parent.fullName.split(" ")[0]}lar Oilasi` : "Oilaviy Portal"}
        unreadCount={unreadCount}
        onLogout={logout}
      />

      <main className="container mx-auto px-4 py-6">
        {parent && summary && (
          <WelcomeCard
            parentName={parent.fullName.split(" ")[0]}
            childrenCount={summary.totalChildren}
            totalPaid={summary.totalPaidAmount}
            totalDebt={summary.totalDebtAmount}
          />
        )}

        {summary && (
          <StatsCards
            childrenCount={summary.totalChildren}
            activeCount={summary.activeChildren}
            totalDebt={summary.totalDebtAmount}
            avgAttendance={avgAttendance}
          />
        )}

        {/* Children Cards */}
        <h3 className="text-lg font-semibold mb-4">Farzandlarim</h3>
        <div className="grid gap-6 lg:grid-cols-3 mb-6">
          {transformedChildren.map((child) => (
            <ChildCard
              key={child.id}
              child={child}
              onSelect={() => {}}
            />
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          <NotificationsCard notifications={transformedNotifications} />
          <QuickActions />
        </div>
      </main>

      <Footer />
    </div>
  )
}
