"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { ArrowLeft, Edit, Phone, Mail, DollarSign, Users, FileText } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

const employee = {
  id: "1",
  fullName: "Ahmedov Rustam Toshmatovich",
  pinfl: "12345678901234",
  department: "Matematika",
  position: "Katta o'qituvchi",
  phone: "+998901234567",
  email: "ahmedov@texnikum.uz",
  status: "active",
  hireDate: "2020-09-01",
  salary: 4500000,
  birthDate: "1985-03-15",
  address: "Toshkent shahar, Yunusobod tumani",
  passport: "AA 1234567",
  education: "O'zbekiston Milliy Universiteti",
  degree: "Magistr",
  bankName: "Xalq banki",
  bankAccount: "8600123456789012",
}

export default function EmployeeDetailPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Faol</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/hr">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Orqaga
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{employee.fullName}</h1>
            <p className="text-muted-foreground">{employee.position} - {employee.department}</p>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Tahrirlash
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar name={employee.fullName} size="xl" className="h-20 w-20 text-xl" />
              {getStatusBadge(employee.status)}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">PINFL</p>
                <p className="font-mono">{employee.pinfl}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ishga kirgan</p>
                <p>{new Date(employee.hireDate).toLocaleDateString('uz-UZ')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon</p>
                <p className="flex items-center gap-2"><Phone className="h-4 w-4" />{employee.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="flex items-center gap-2"><Mail className="h-4 w-4" />{employee.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Oylik</p>
                <p className="flex items-center gap-2 text-green-600 font-semibold">
                  <DollarSign className="h-4 w-4" />{formatCurrency(employee.salary)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Umumiy</TabsTrigger>
          <TabsTrigger value="documents">Hujjatlar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Shaxsiy ma'lumotlar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tug'ilgan</span>
                    <span>{new Date(employee.birthDate).toLocaleDateString('uz-UZ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Manzil</span>
                    <span>{employee.address}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" />Passport</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seriya</span>
                    <span className="font-mono">{employee.passport}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ma'lumot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OTM</span>
                    <span>{employee.education}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Daraja</span>
                    <span>{employee.degree}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" />Bank</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank</span>
                    <span>{employee.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hisob</span>
                    <span className="font-mono">{employee.bankAccount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Hujjatlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["Mehnat shartnomasi", "Mehnat daftarchasi", "Tibbiy kitob", "Passport nusxasi", "Diplom nusxasi"].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <span>{doc}</span>
                    <Badge variant="success">Mavjud</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
