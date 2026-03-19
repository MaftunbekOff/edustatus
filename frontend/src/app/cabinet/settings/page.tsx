"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Save,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Database,
  Key,
  Globe,
  Mail,
  Percent,
  DollarSign,
} from "lucide-react"

export default function SuperAdminSettingsPage() {
  const [saved, setSaved] = React.useState(false)

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-muted-foreground">
          Platforma sozlamalari va konfiguratsiyalar
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Platform Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Platforma ma'lumotlari</CardTitle>
            </div>
            <CardDescription>
              Asosiy platforma sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Platforma nomi</label>
              <Input defaultValue="Texnikum.uz" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asosiy domen</label>
              <Input defaultValue="texnikum.uz" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin email</label>
              <Input defaultValue="admin@platform.uz" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Qo'llab-quvvatlash email</label>
              <Input defaultValue="support@platform.uz" />
            </div>
          </CardContent>
        </Card>

        {/* Pricing Plans */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tariflar</CardTitle>
            </div>
            <CardDescription>
              Oylik obuna narxlari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Basic</p>
                <p className="text-sm text-muted-foreground">5 guruh, oddiy hisobotlar</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue="1000000"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">so'm/oy</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Pro</p>
                <p className="text-sm text-muted-foreground">20 guruh, bank integratsiyasi</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue="2500000"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">so'm/oy</span>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Enterprise</p>
                <p className="text-sm text-muted-foreground">Cheksiz, barcha funksiyalar</p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  defaultValue="5000000"
                  className="w-32"
                />
                <span className="text-sm text-muted-foreground">so'm/oy</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Systems */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">To'lov tizimlari</CardTitle>
            </div>
            <CardDescription>
              To'lov qabul qilish uchun integratsiyalar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <span className="text-sm font-bold text-blue-600">C</span>
                </div>
                <div>
                  <p className="font-medium">Click</p>
                  <p className="text-sm text-muted-foreground">Merchant ID: 12345</p>
                </div>
              </div>
              <Badge variant="success">Faol</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                  <span className="text-sm font-bold text-green-600">P</span>
                </div>
                <div>
                  <p className="font-medium">Payme</p>
                  <p className="text-sm text-muted-foreground">Merchant ID: 67890</p>
                </div>
              </div>
              <Badge variant="success">Faol</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                  <span className="text-sm font-bold text-purple-600">U</span>
                </div>
                <div>
                  <p className="font-medium">Uzum Bank</p>
                  <p className="text-sm text-muted-foreground">Merchant ID: 11111</p>
                </div>
              </div>
              <Badge variant="secondary">Sozlanmoqda</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Bildirishnomalar</CardTitle>
            </div>
            <CardDescription>
              Avtomatik bildirishnoma sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Obuna eslatmasi</p>
                <p className="text-sm text-muted-foreground">
                  Tugashiga 7 kun qolganda eslatma
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">To'lov tasdiqlash</p>
                <p className="text-sm text-muted-foreground">
                  To'lov qabul qilinganda email
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Yangi texnikum</p>
                <p className="text-sm text-muted-foreground">
                  Yangi ro'yxatdan o'tganda
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin email manzili</label>
              <Input defaultValue="admin@platform.uz" />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Xavfsizlik</CardTitle>
            </div>
            <CardDescription>
              Tizim xavfsizlik sozlamalari
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Ikki faktorli autentifikatsiya</p>
                <p className="text-sm text-muted-foreground">
                  Kirishda SMS tasdiqlash
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">IP cheklovi</p>
                <p className="text-sm text-muted-foreground">
                  Faqat ruxsat etilgan IP lar
                </p>
              </div>
              <input type="checkbox" className="h-4 w-4" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Seans vaqti (daqiqa)</label>
              <Input type="number" defaultValue="60" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Maksimal kirish urinishlari</label>
              <Input type="number" defaultValue="5" />
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">API kalitlar</CardTitle>
            </div>
            <CardDescription>
              Integratsiya uchun API kalitlar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Public API Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  defaultValue="pk_live_xxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
                <Button variant="outline">Ko'rsatish</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret API Key</label>
              <div className="flex gap-2">
                <Input
                  type="password"
                  defaultValue="sk_live_xxxxxxxxxxxxxxxxxxxxx"
                  className="font-mono"
                />
                <Button variant="outline">Ko'rsatish</Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Webhook URL</label>
              <Input
                defaultValue="https://api.platform.uz/webhook"
                className="font-mono text-sm"
              />
            </div>
            <Button variant="outline" className="w-full">
              <Key className="mr-2 h-4 w-4" />
              Yangi kalit yaratish
            </Button>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Ma'lumotlar bazasi</CardTitle>
            </div>
            <CardDescription>
              Backup va tiklash
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">Avtomatik backup</p>
                <p className="text-sm text-muted-foreground">
                  Har kuni soat 00:00 da
                </p>
              </div>
              <input type="checkbox" defaultChecked className="h-4 w-4" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Oxirgi backup</p>
                <p className="text-sm text-muted-foreground">
                  2025-02-13 00:00:00
                </p>
              </div>
              <Button variant="outline" size="sm">
                Yuklab olish
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Ma'lumotlar bazasi hajmi</p>
                <p className="text-sm text-muted-foreground">2.4 GB</p>
              </div>
              <Badge variant="secondary">Normal</Badge>
            </div>
            <Button variant="outline" className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Backup yaratish
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="w-full md:w-auto">
          <Save className="mr-2 h-4 w-4" />
          {saved ? "Saqlandi!" : "Saqlash"}
        </Button>
      </div>
    </div>
  )
}
