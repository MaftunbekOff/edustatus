"use client"

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  CreditCard,
  QrCode,
  GraduationCap,
  School,
  Baby,
  Users,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Child {
  id: string
  fullName: string
  pinfl: string
  institution: {
    name: string
    type: string
    address: string
  }
  group?: string
  specialty?: string
  course?: number
  class?: string
  contractNumber?: string
  totalAmount?: number
  paidAmount?: number
  debtAmount?: number
  nextPaymentDate?: string | null
  status: string
  grades?: { subject: string; grade: number; credits?: number }[]
  attendance: number
  monthlyFee?: number
  todayMenu?: string[]
}

interface ChildCardProps {
  child: Child
  onSelect?: () => void
}

export function ChildCard({ child, onSelect }: ChildCardProps) {
  const getInstitutionIcon = (type: string) => {
    switch (type) {
      case "texnikum":
      case "universitet":
        return <GraduationCap className="h-5 w-5" />
      case "maktab":
        return <School className="h-5 w-5" />
      case "bogcha":
        return <Baby className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getInstitutionColor = (type: string) => {
    switch (type) {
      case "texnikum":
      case "universitet":
        return "bg-blue-100 text-blue-600"
      case "maktab":
        return "bg-green-100 text-green-600"
      case "bogcha":
        return "bg-pink-100 text-pink-600"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getHeaderColor = (type: string) => {
    switch (type) {
      case "texnikum":
        return "bg-blue-500"
      case "maktab":
        return "bg-green-500"
      case "bogcha":
        return "bg-pink-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className={`h-2 ${getHeaderColor(child.institution.type)}`} />
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getInstitutionColor(child.institution.type)}`}>
              {getInstitutionIcon(child.institution.type)}
            </div>
            <div>
              <CardTitle className="text-base">{child.fullName}</CardTitle>
              <CardDescription className="text-xs">
                {child.institution.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant="success">Faol</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Institution specific info */}
          {child.institution.type === "texnikum" && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Guruh:</span>
                <span className="font-medium">{child.group}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Mutaxassislik:</span>
                <span className="font-medium">{child.specialty}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Shartnoma:</span>
                <span className="font-mono text-xs">{child.contractNumber}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">To'lov holati:</span>
                <div className="text-right">
                  <p className="font-medium text-green-600">{formatCurrency(child.paidAmount || 0)}</p>
                  {(child.debtAmount || 0) > 0 && (
                    <p className="text-xs text-red-600">Qarz: {formatCurrency(child.debtAmount || 0)}</p>
                  )}
                </div>
              </div>
            </>
          )}

          {child.institution.type === "maktab" && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sinf:</span>
                <span className="font-medium">{child.class}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">O'rtacha baho:</span>
                <span className="font-medium text-green-600">
                  {child.grades && child.grades.length > 0
                    ? (child.grades.reduce((sum, g) => sum + g.grade, 0) / child.grades.length).toFixed(1)
                    : "-"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Davomat:</span>
                <span className="font-medium">{child.attendance}%</span>
              </div>
            </>
          )}

          {child.institution.type === "bogcha" && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Guruh:</span>
                <span className="font-medium">{child.group}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Oylik to'lov:</span>
                <span className="font-medium">{formatCurrency(child.monthlyFee || 0)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bugungi menyu:</span>
                <span className="text-xs text-green-600">{child.todayMenu?.length || 0} ta ovqat</span>
              </div>
            </>
          )}

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Davomat:</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{ width: `${child.attendance}%` }}
                  />
                </div>
                <span className="font-medium">{child.attendance}%</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <CreditCard className="mr-1 h-3 w-3" />
              To'lash
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <QrCode className="mr-1 h-3 w-3" />
              QR
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={onSelect}>
              Batafsil
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}