"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Settings,
  Building2,
  Bell,
  Shield,
  CreditCard,
  Users,
  Save,
} from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-muted-foreground">
          Tizim sozlamalari va konfiguratsiya
        </p>
      </div>

      {/* Institution Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Muassasa ma'lumotlari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Muassasa nomi</label>
              <Input defaultValue="Tibbiyot texnikumi" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">STIR</label>
              <Input defaultValue="123456789" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Manzil</label>
              <Input defaultValue="Toshkent sh., Chilonzor tumani" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Telefon</label>
              <Input defaultValue="+99871 123-45-67" className="mt-1" />
            </div>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Saqlash
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Bildirishnomalar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">SMS bildirishnomalar</p>
              <p className="text-sm text-muted-foreground">
                Qarzdorlik haqida SMS yuborish
              </p>
            </div>
            <Badge variant="success">Yoqilgan</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Telegram bildirishnomalar</p>
              <p className="text-sm text-muted-foreground">
                Telegram bot orqali xabarlar
              </p>
            </div>
            <Badge variant="success">Yoqilgan</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Email hisobotlar</p>
              <p className="text-sm text-muted-foreground">
                Haftalik hisobotlarni emailga yuborish
              </p>
            </div>
            <Badge variant="secondary">O'chirilgan</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            To'lov sozlamalari
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Shartnoma summasi (oylik)</label>
              <Input defaultValue="1,000,000" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Bank hisob raqami</label>
              <Input defaultValue="20208000912345678001" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">MFO</label>
              <Input defaultValue="01001" className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Click merchant ID</label>
              <Input defaultValue="12345" className="mt-1" />
            </div>
          </div>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Saqlash
          </Button>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Xavfsizlik
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Ikki faktorli autentifikatsiya</p>
              <p className="text-sm text-muted-foreground">
                Kirishda SMS kod talab qilinadi
              </p>
            </div>
            <Badge variant="secondary">O'chirilgan</Badge>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium">Login tarixi</p>
              <p className="text-sm text-muted-foreground">
                Oxirgi kirish: 2025-01-15 10:30
              </p>
            </div>
            <Button variant="outline" size="sm">
              Ko'rish
            </Button>
          </div>
          <Button variant="outline">
            Parolni o'zgartirish
          </Button>
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Foydalanuvchilar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <span className="font-medium text-blue-600">AD</span>
                </div>
                <div>
                  <p className="font-medium">Admin</p>
                  <p className="text-sm text-muted-foreground">admin@texnikum.uz</p>
                </div>
              </div>
              <Badge variant="success">Administrator</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <span className="font-medium text-green-600">BX</span>
                </div>
                <div>
                  <p className="font-medium">Buxgalter</p>
                  <p className="text-sm text-muted-foreground">buxgalter@texnikum.uz</p>
                </div>
              </div>
              <Badge variant="secondary">Buxgalter</Badge>
            </div>
          </div>
          <Button className="mt-4">
            <Users className="mr-2 h-4 w-4" />
            Foydalanuvchi qo'shish
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
