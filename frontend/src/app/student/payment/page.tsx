"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  CheckCircle,
  Shield,
  ArrowLeft,
  Copy,
  ExternalLink,
  Clock,
  AlertTriangle,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

// Mock student data
const studentData = {
  fullName: "Aliyev Anvar Abdullaevich",
  contractNumber: "CT-2024-00123",
  group: "101-A",
  totalAmount: 5000000,
  paidAmount: 3500000,
  debtAmount: 1500000,
}

const paymentSystems = [
  {
    id: "click",
    name: "Click",
    logo: "C",
    color: "bg-blue-500",
    description: "Click ilovasi orqali to'lash",
    commission: 0,
  },
  {
    id: "payme",
    name: "Payme",
    logo: "P",
    color: "bg-green-500",
    description: "Payme ilovasi orqali to'lash",
    commission: 0,
  },
  {
    id: "uzum",
    name: "Uzum Bank",
    logo: "U",
    color: "bg-purple-500",
    description: "Uzum Bank ilovasi orqali to'lash",
    commission: 0,
  },
]

const recentPayments = [
  { id: "1", amount: 1500000, date: "2025-01-15", method: "Bank", status: "success" },
  { id: "2", amount: 1000000, date: "2024-12-10", method: "Click", status: "success" },
  { id: "3", amount: 1000000, date: "2024-11-05", method: "Payme", status: "success" },
]

export default function StudentPaymentPage() {
  const [selectedAmount, setSelectedAmount] = React.useState<number | null>(null)
  const [customAmount, setCustomAmount] = React.useState("")
  const [selectedSystem, setSelectedSystem] = React.useState<string | null>(null)
  const [isProcessing, setIsProcessing] = React.useState(false)

  const amountOptions = [
    { value: 500000, label: "500,000 so'm" },
    { value: 1000000, label: "1,000,000 so'm" },
    { value: 1500000, label: "1,500,000 so'm" },
    { value: studentData.debtAmount, label: "To'liq to'lash" },
  ]

  const handlePayment = () => {
    if (!selectedSystem || (!selectedAmount && !customAmount)) return
    
    setIsProcessing(true)
    // Simulate payment redirect
    setTimeout(() => {
      // In real app, redirect to payment system
      alert(`${selectedSystem} ga yo'naltirilmoqda...`)
      setIsProcessing(false)
    }, 1500)
  }

  const paymentAmount = selectedAmount || parseInt(customAmount) || 0

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
                <h1 className="font-semibold">Onlayn to'lov</h1>
                <p className="text-sm text-white/80">Shartnoma: {studentData.contractNumber}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Debt Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qarzdorlik</p>
                <p className="text-3xl font-bold text-red-600">
                  {formatCurrency(studentData.debtAmount)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">To'langan</p>
                <p className="text-xl font-semibold text-green-600">
                  {formatCurrency(studentData.paidAmount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((studentData.paidAmount / studentData.totalAmount) * 100)}% to'langan
                </p>
              </div>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{
                  width: `${(studentData.paidAmount / studentData.totalAmount) * 100}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Amount Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">To'lov miqdorini tanlang</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {amountOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedAmount === option.value ? "default" : "outline"}
                  className="h-auto py-3"
                  onClick={() => {
                    setSelectedAmount(option.value)
                    setCustomAmount("")
                  }}
                >
                  <div className="text-center">
                    <p className="font-semibold">{option.label}</p>
                  </div>
                </Button>
              ))}
            </div>

            <div className="relative">
              <p className="text-sm text-muted-foreground mb-2">Yoki boshqa summa kiriting:</p>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Summani kiriting"
                  className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value)
                    setSelectedAmount(null)
                  }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  so'm
                </span>
              </div>
            </div>

            {paymentAmount > studentData.debtAmount && (
              <div className="flex items-center gap-2 rounded-lg bg-yellow-50 border border-yellow-200 p-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <p className="text-sm text-yellow-700">
                  Kiritilgan summa qarzdorlikdan ortiq. Ortgan summa keyingi o'quv yiliga o'tkaziladi.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment System Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">To'lov usulini tanlang</CardTitle>
            <CardDescription>
              Quyidagi to'lov tizimlaridan birini tanlang
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentSystems.map((system) => (
              <div
                key={system.id}
                className={`flex items-center gap-4 rounded-lg border p-4 cursor-pointer transition-all ${
                  selectedSystem === system.id
                    ? "border-green-500 bg-green-50"
                    : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedSystem(system.id)}
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${system.color} text-white font-bold text-lg`}>
                  {system.logo}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{system.name}</p>
                  <p className="text-sm text-muted-foreground">{system.description}</p>
                </div>
                {system.commission > 0 && (
                  <p className="text-sm text-muted-foreground">
                    +{system.commission}% komissiya
                  </p>
                )}
                {selectedSystem === system.id && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        {paymentAmount > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">To'lov ma'lumotlari</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Talaba</span>
                <span className="font-medium">{studentData.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shartnoma</span>
                <span className="font-medium">{studentData.contractNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Guruh</span>
                <span className="font-medium">{studentData.group}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To'lov miqdori</span>
                <span className="font-semibold text-lg">{formatCurrency(paymentAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Komissiya</span>
                <span className="font-medium text-green-600">0 so'm</span>
              </div>
              <div className="border-t pt-4 flex justify-between">
                <span className="font-semibold">Jami</span>
                <span className="font-bold text-xl">{formatCurrency(paymentAmount)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pay Button */}
        <Button
          className="w-full h-14 text-lg"
          disabled={!selectedSystem || paymentAmount <= 0 || isProcessing}
          onClick={handlePayment}
        >
          {isProcessing ? (
            <>
              <Clock className="mr-2 h-5 w-5 animate-spin" />
              Yo'naltirilmoqda...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              {paymentAmount > 0 ? `${formatCurrency(paymentAmount)} to'lash` : "To'lash"}
            </>
          )}
        </Button>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>To'lovlar xavfsiz SSL shifrlash orqali amalga oshiriladi</span>
        </div>

        {/* Recent Payments */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">So'nggi to'lovlar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {payment.date} • {payment.method}
                    </p>
                  </div>
                  <Badge variant="success">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Muvaffaqiyatli
                  </Badge>
                </div>
              ))}
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
