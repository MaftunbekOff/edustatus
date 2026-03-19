/**
 * FinanceTab Component
 * 
 * Displays financial information for an organization including:
 * - Revenue statistics
 * - Plan details
 * - Recent transactions (from real API)
 * 
 * Following Single Responsibility Principle - handles only finance display.
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  DollarSign,
  Receipt,
  Calendar,
  CreditCard,
  ArrowUpRight,
  Loader2,
} from "lucide-react"
import {
  PLAN_COLORS,
  STATUS_COLORS,
  STATUS_LABELS,
} from "@/lib/constants/organization-detail"
import { formatCurrency, formatDate } from "@/lib/utils/organization"

/**
 * Payment type from API
 */
interface Payment {
  id: string
  amount: number
  status: string
  paymentMethod: string
  paymentDate: string
  createdAt: string
  description?: string
  student: {
    id: string
    fullName: string
    group?: { name: string }
  }
}

/**
 * Organization stats type
 */
export interface OrganizationStats {
  studentsCount?: number
  groupsCount?: number
  totalRevenue?: number
}

/**
 * Organization type for finance tab
 */
export interface OrganizationForFinance {
  id: string
  plan: string
  status: string
  studentLimit: number
  groupLimit: number
  allowSubColleges?: boolean
  subscriptionEndsAt?: string | Date | null
}

/**
 * Props for FinanceTab component
 */
export interface FinanceTabProps {
  organization: OrganizationForFinance
  stats: OrganizationStats | null
  token: string | null
}

/**
 * FinanceTab Component
 * 
 * @param organization - Organization data
 * @param stats - Organization statistics
 * @param token - Auth token for API calls
 */
export function FinanceTab({ organization, stats, token }: FinanceTabProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const monthlyRevenue = Math.round((stats?.totalRevenue || 0) / 12)

  // Fetch payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      if (!token || !organization.id) return
      
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/organizations/${organization.id}/payments`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          setPayments(data)
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPayments()
  }, [token, organization.id])

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get status label
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Tasdiqlangan'
      case 'pending': return 'Kutilmoqda'
      case 'rejected': return 'Rad etilgan'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Finance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <Wallet className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Jami daromad</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(stats?.totalRevenue)} so'm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oylik daromad</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(monthlyRevenue)} so'm
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Receipt className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">To'lovlar soni</p>
                <p className="text-xl font-bold">{stats?.studentsCount || 0} ta</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Keyingi to'lov</p>
                <p className="text-xl font-bold">
                  {formatDate(organization.subscriptionEndsAt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tarif ma'lumotlari */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Tarif ma'lumotlari
          </CardTitle>
          <CardDescription>Joriy tarif va uning imkoniyatlari</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Joriy tarif</span>
                <Badge variant={PLAN_COLORS[organization.plan] as "outline" | "secondary" | "default"} className="text-sm">
                  {organization.plan.toUpperCase()}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge variant={STATUS_COLORS[organization.status]}>
                  {STATUS_LABELS[organization.status]}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Obuna tugashi</span>
                <span className="font-medium">
                  {formatDate(organization.subscriptionEndsAt)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Talabalar chegarasi</span>
                <span className="font-bold text-blue-600">{organization.studentLimit} ta</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Guruhlar chegarasi</span>
                <span className="font-bold text-purple-600">{organization.groupLimit} ta</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Quyi tashkilotlar</span>
                <span className="font-bold text-teal-600">
                  {organization.allowSubColleges ? "Ruxsat etilgan" : "Ruxsat etilmagan"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* So'nggi tranzaksiyalar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">So'nggi tranzaksiyalar</CardTitle>
          <CardDescription>Tashkilot tomonidan amalga oshirilgan to'lovlar</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Tranzaksiyalar topilmadi
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <ArrowUpRight className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.student?.fullName || 'Noma\'lum talaba'}</p>
                      <p className="text-sm text-muted-foreground">
                        {payment.student?.group?.name || 'Guruhsiz'} · {new Date(payment.paymentDate).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      {payment.amount?.toLocaleString()} so'm
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
