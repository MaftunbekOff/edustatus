"use client"

import * as React from "react"
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
import {
  User,
  CreditCard,
  Download,
  CheckCircle,
  Clock,
  Bell,
  Plus,
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useStudentData } from "@/lib/hooks/useStudentData"
import { PAYMENT_METHOD_LABELS } from "@/lib/constants/common"
import Link from "next/link"

// ==========================================
// LOGIN FORM COMPONENT
// ==========================================

interface LoginFormProps {
  onLogin: (method: "pinfl" | "contract", value: string) => void
}

function LoginForm({ onLogin }: LoginFormProps) {
  const [searchType, setSearchType] = React.useState<"pinfl" | "contract">("pinfl")
  const [value, setValue] = React.useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin(searchType, value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-600">
            <User className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl">Talaba Portali</CardTitle>
          <p className="text-muted-foreground">
            To'lov ma'lumotlarini ko'rish uchun tizimga kiring
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                variant={searchType === "pinfl" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSearchType("pinfl")}
              >
                PINFL
              </Button>
              <Button
                type="button"
                variant={searchType === "contract" ? "default" : "outline"}
                className="flex-1"
                onClick={() => setSearchType("contract")}
              >
                Shartnoma
              </Button>
            </div>

            {searchType === "pinfl" ? (
              <div className="space-y-2">
                <label className="text-sm font-medium">PINFL (JSHSHIR)</label>
                <Input
                  type="text"
                  placeholder="14 raqamli PINFL"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  maxLength={14}
                  required
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">Shartnoma raqami</label>
                <Input
                  type="text"
                  placeholder="CT-2024-XXXXX"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full">
              Kirish
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// STUDENT INFO CARD COMPONENT
// ==========================================

interface StudentInfoCardProps {
  student: {
    fullName: string
    pinfl: string
    contractNumber: string
    group: string
    specialty: string
    phone: string
    email: string
  }
}

function StudentInfoCard({ student }: StudentInfoCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <User className="h-10 w-10 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{student.fullName}</h2>
            <div className="mt-2 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
              <p>
                <span className="font-medium">Shartnoma:</span>{" "}
                {student.contractNumber}
              </p>
              <p>
                <span className="font-medium">Guruh:</span> {student.group}
              </p>
              <p>
                <span className="font-medium">Mutaxassislik:</span>{" "}
                {student.specialty}
              </p>
              <p>
                <span className="font-medium">PINFL:</span> {student.pinfl}
              </p>
              <p>
                <span className="font-medium">Telefon:</span> {student.phone}
              </p>
              <p>
                <span className="font-medium">Email:</span> {student.email}
              </p>
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
  totalAmount: number
  paidAmount: number
  debtAmount: number
}

function StatsCards({ totalAmount, paidAmount, debtAmount }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Umumiy summa</p>
              <p className="text-xl font-bold">{formatCurrency(totalAmount)}</p>
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
              <p className="text-sm text-muted-foreground">To'langan</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(paidAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Qarzdorlik</p>
              <p className="text-xl font-bold text-yellow-600">
                {formatCurrency(debtAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ==========================================
// PROGRESS CARD COMPONENT
// ==========================================

interface ProgressCardProps {
  paidAmount: number
  totalAmount: number
  percent: number
}

function ProgressCard({ paidAmount, totalAmount, percent }: ProgressCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">To'lov progressi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {formatCurrency(paidAmount)} / {formatCurrency(totalAmount)}
            </span>
            <span className="text-sm font-medium">{percent}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-gray-200">
            <div
              className="h-4 rounded-full bg-green-500 transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ==========================================
// QUICK ACTIONS COMPONENT
// ==========================================

function QuickActions() {
  return (
    <div className="grid gap-4 md:grid-cols-2 mb-6">
      <Link href="/student/payment">
        <Card className="cursor-pointer hover:border-green-300 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold">Onlayn to'lov</p>
                <p className="text-sm text-muted-foreground">
                  Click, Payme, Uzum orqali to'lash
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>

      <Link href="/student/notifications">
        <Card className="cursor-pointer hover:border-blue-300 transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">Bildirishnomalar</p>
                <p className="text-sm text-muted-foreground">
                  To'lov eslatmalari va xabarlar
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  )
}

// ==========================================
// PAYMENT HISTORY TABLE COMPONENT
// ==========================================

interface PaymentHistoryTableProps {
  payments: Array<{
    id: string
    date: string
    amount: number
    method: string
    status: string
    receipt: string
  }>
}

function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">To'lovlar tarixi</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sana</TableHead>
              <TableHead>Summa</TableHead>
              <TableHead>Usul</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{formatDate(payment.date)}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(payment.amount)}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {PAYMENT_METHOD_LABELS[payment.method as keyof typeof PAYMENT_METHOD_LABELS] || payment.method}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="success">Tasdiqlangan</Badge>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    <Download className="mr-1 h-4 w-4" />
                    Kvitansiya
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

// ==========================================
// HEADER COMPONENT
// ==========================================

interface HeaderProps {
  onLogout: () => void
}

function Header({ onLogout }: HeaderProps) {
  return (
    <header className="bg-green-600 text-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <span className="text-lg font-bold">T</span>
            </div>
            <div>
              <h1 className="font-semibold">Tibbiyot Texnikumi</h1>
              <p className="text-sm text-white/80">Talaba Portali</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={onLogout}
          >
            Chiqish
          </Button>
        </div>
      </div>
    </header>
  )
}

// ==========================================
// FOOTER COMPONENT
// ==========================================

function Footer() {
  return (
    <footer className="bg-gray-100 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © 2025 Tibbiyot Texnikumi. Barcha huquqlar himoyalangan.
      </div>
    </footer>
  )
}

// ==========================================
// MAIN PAGE COMPONENT
// ==========================================

export default function StudentPortalPage() {
  const {
    student,
    paymentSummary,
    payments,
    isLoggedIn,
    login,
    logout,
  } = useStudentData({ useMock: true })

  const handleLogin = (method: "pinfl" | "contract", value: string) => {
    login({ method, [method === "pinfl" ? "pinfl" : "contractNumber"]: value })
  }

  if (!isLoggedIn || !student) {
    return <LoginForm onLogin={handleLogin} />
  }

  const paidPercent = paymentSummary
    ? Math.round((paymentSummary.paidAmount / paymentSummary.totalAmount) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={logout} />

      <main className="container mx-auto px-4 py-8">
        <StudentInfoCard student={student} />

        {paymentSummary && (
          <>
            <StatsCards
              totalAmount={paymentSummary.totalAmount}
              paidAmount={paymentSummary.paidAmount}
              debtAmount={paymentSummary.debtAmount}
            />

            <ProgressCard
              paidAmount={paymentSummary.paidAmount}
              totalAmount={paymentSummary.totalAmount}
              percent={paidPercent}
            />
          </>
        )}

        <QuickActions />

        <PaymentHistoryTable payments={payments} />
      </main>

      <Footer />
    </div>
  )
}
