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
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Search,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data - PINFL duplicates
const duplicates = [
  {
    id: "1",
    pinfl: "12345678901234",
    students: [
      { name: "Aliyev Anvar Abdullaevich", institution: "Tibbiyot texnikumi", group: "101-A" },
      { name: "Aliyev Anvar A.", institution: "Pedagogika kolleji", group: "201-B" },
    ],
    risk: "high",
    amount: 24000000,
  },
  {
    id: "2",
    pinfl: "23456789012345",
    students: [
      { name: "Valiyeva Dilnoza Karimovna", institution: "Tibbiyot texnikumi", group: "102-B" },
      { name: "Valiyeva D.K.", institution: "Iqtisodiyot kolleji", group: "301-V" },
    ],
    risk: "medium",
    amount: 18000000,
  },
  {
    id: "3",
    pinfl: "34567890123456",
    students: [
      { name: "Karimov Bobur Rahimovich", institution: "Tibbiyot texnikumi", group: "101-A" },
      { name: "Karimov B.R.", institution: "Agrar kolleji", group: "102-A" },
    ],
    risk: "low",
    amount: 12000000,
  },
]

export default function DuplicatesPage() {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "high":
        return <Badge variant="error">Yuqori xavf</Badge>
      case "medium":
        return <Badge variant="warning">O'rtacha xavf</Badge>
      case "low":
        return <Badge variant="success">Past xavf</Badge>
      default:
        return <Badge>{risk}</Badge>
    }
  }

  const totalRisk = duplicates.reduce((sum, d) => sum + d.amount, 0)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">PINFL Dublikatlar</h1>
          <p className="text-muted-foreground">
            Bir xil PINFL bilan ro'yxatdan o'tgan talabalar
          </p>
        </div>
        <Button>
          <Search className="mr-2 h-4 w-4" />
          Yangi tekshirish
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topilgan dublikatlar</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{duplicates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yuqori xavf</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {duplicates.filter((d) => d.risk === "high").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Xavf summasi</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{formatCurrency(totalRisk)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hal qilingan</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicates List */}
      <div className="space-y-4">
        {duplicates.map((duplicate) => (
          <Card key={duplicate.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg">{duplicate.pinfl}</span>
                    {getRiskBadge(duplicate.risk)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mumkin bo'lgan yo'qotish: {formatCurrency(duplicate.amount)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Tasdiqlash
                  </Button>
                  <Button variant="outline" size="sm">
                    <XCircle className="mr-2 h-4 w-4" />
                    Rad etish
                  </Button>
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>F.I.O.</TableHead>
                    <TableHead>Muassasa</TableHead>
                    <TableHead>Guruh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duplicate.students.map((student, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.institution}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student.group}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
