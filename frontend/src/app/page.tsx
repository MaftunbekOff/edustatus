"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  Users,
  CreditCard,
  AlertTriangle,
  Shield,
  Bell,
  QrCode,
  FileText,
  CheckCircle,
  Zap,
  Cloud,
  Lock,
  Baby,
  School,
  Building2,
  ArrowRight,
  Play,
  BarChart3,
} from "lucide-react"
import Link from "next/link"

const problems = [
  {
    icon: Users,
    title: '"O\'lik jonlar"',
    description: "Qog'ozda bor, lekin amalda yo'q o'quvchilar",
    solution: "PINFL orqali dublikat aniqlash",
    iconBg: "bg-red-500",
    iconColor: "text-white",
    solutionColor: "text-green-400",
  },
  {
    icon: CreditCard,
    title: '"Pulingiz yetib kelmadi"',
    description: "Ota-ona to'laydi, buxgalter ko'rmaydi",
    solution: "Avtomatik bank biriktirish",
    iconBg: "bg-yellow-500",
    iconColor: "text-white",
    solutionColor: "text-green-400",
  },
  {
    icon: AlertTriangle,
    title: '"Kechikkan to\'lovlar"',
    description: "O'qituvchilarga oylik berilmaydi",
    solution: "SMS/Telegram eslatmalar",
    iconBg: "bg-orange-500",
    iconColor: "text-white",
    solutionColor: "text-green-400",
  },
  {
    icon: Building2,
    title: "Turli muassasalar",
    description: "Bog'cha, maktab, texnikum - har xil",
    solution: "Modul arxitekturasi",
    iconBg: "bg-blue-500",
    iconColor: "text-white",
    solutionColor: "text-green-400",
  },
]

const features = [
  { icon: Shield, title: "PINFL dublikat", href: "/dashboard/duplicates", iconBg: "bg-red-500" },
  { icon: CreditCard, title: "Auto-reconciliation", href: "/dashboard/bank", iconBg: "bg-yellow-500" },
  { icon: Bell, title: "SMS/Telegram", href: "/dashboard/reminders", iconBg: "bg-orange-500" },
  { icon: QrCode, title: "QR davomat", href: "/dashboard/attendance", iconBg: "bg-purple-500" },
  { icon: FileText, title: "Shartnomalar", href: "/dashboard/contracts", iconBg: "bg-blue-500" },
  { icon: Users, title: "Yagona Login", href: "/parent", iconBg: "bg-green-500" },
]

const stats = [
  { value: "10,000+", label: "Ta'lim muassasalari" },
  { value: "5M+", label: "Talabalar" },
  { value: "25T", label: "Bozor hajmi (so'm/yil)" },
  { value: "40%", label: "Vaqt tejash" },
]

const pricing = [
  { name: "Basic", price: "500,000", students: "100 ta", popular: false },
  { name: "Pro", price: "1,000,000", students: "500 ta", popular: true },
  { name: "Enterprise", price: "2,000,000", students: "Cheksiz", popular: false },
]

const demoLinks = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Talabalar", href: "/dashboard/students", icon: Users },
  { name: "To'lovlar", href: "/dashboard/payments", icon: CreditCard },
  { name: "Qarzdorlar", href: "/dashboard/debtors", icon: AlertTriangle },
  { name: "Dublikatlar", href: "/dashboard/duplicates", icon: Shield },
  { name: "Bank reestr", href: "/dashboard/bank", icon: FileText },
  { name: "Eslatmalar", href: "/dashboard/reminders", icon: Bell },
  { name: "Davomat", href: "/dashboard/attendance", icon: QrCode },
  { name: "Ota-ona", href: "/parent", icon: Users },
  { name: "Cabinet", href: "/cabinet", icon: Building2 },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 md:py-16 text-center">
        <Badge className="mb-4 bg-purple-500 text-white border-0 text-xs md:text-sm">
          🎯 Ta'lim Muassasalari uchun
        </Badge>
        <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white leading-tight">
          Moliyaviy Monitoring Tizimi
        </h1>
        <p className="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
          O'zbekistondagi ta'lim muassasalarida moliyaviy jarayonlarni raqamlashtirish
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
              <Play className="mr-2 h-5 w-5" />
              Demo ni ko'rish
            </Button>
          </Link>
          <a href="#features" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto bg-white/10 text-white hover:bg-white/20 border border-white/30">
              Batafsil
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-white/10 border-0 backdrop-blur">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-300">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Problems Section */}
      <section className="container mx-auto px-4 py-8 md:py-16" id="problems">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-white">❌ "Xalq Muammosi"</h2>
          <p className="text-sm md:text-base text-gray-300">Real muammolar va ularning yechimlari</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {problems.map((problem, index) => (
            <Card key={index} className="bg-white/10 border-0 backdrop-blur hover:bg-white/15 transition-all">
              <CardContent className="pt-6">
                <div className={`flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full mb-3 md:mb-4 ${problem.iconBg}`}>
                  <problem.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h3 className="font-semibold text-base md:text-lg mb-1 md:mb-2 text-white">{problem.title}</h3>
                <p className="text-xs md:text-sm text-gray-300 mb-3 md:mb-4">{problem.description}</p>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-green-400" />
                  <span className="text-xs md:text-sm text-green-400">{problem.solution}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16" id="features">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 text-white">✅ Asosiy Funksiyalar</h2>
          <p className="text-gray-300">Bosing va demo ko'ring</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <Card className="bg-white/10 border-0 backdrop-blur hover:bg-white/20 transition-all cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-3 ${feature.iconBg}`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-sm text-white">{feature.title}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Demo Links */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-white">🎬 Demo Sahifalar</h2>
          <p className="text-sm md:text-base text-gray-300">Barcha sahifalarni sinab ko'ring</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
          {demoLinks.map((link, index) => (
            <Link key={index} href={link.href}>
              <Button className="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs md:text-sm h-10 md:h-auto">
                <link.icon className="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
                {link.name}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-8 md:py-16" id="pricing">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-white">💰 Tariflar</h2>
          <p className="text-sm md:text-base text-gray-300">Oylik obuna to'lovi</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {pricing.map((plan, index) => (
            <Card key={index} className={`backdrop-blur ${
              plan.popular 
                ? "bg-purple-600 border-0 sm:scale-105" 
                : "bg-white/10 border-0"
            }`}>
              <CardContent className="pt-6 text-center">
                {plan.popular && (
                  <Badge className="mb-4 bg-white text-purple-600">Mashhur</Badge>
                )}
                <h3 className="text-lg md:text-xl font-bold mb-2 text-white">{plan.name}</h3>
                <p className="text-2xl md:text-3xl font-bold mb-1 text-white">{plan.price}</p>
                <p className="text-xs md:text-sm text-gray-300 mb-4">so'm / oy</p>
                <p className="text-xs md:text-sm text-gray-200">{plan.students} talaba</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Advantages */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-white">🏆 Afzalliklar</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-green-500 mx-auto mb-3 md:mb-4">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-sm md:text-base">Soddalik</h3>
              <p className="text-xs md:text-sm text-gray-300">Buxgalter IT-mutaxassis emas. "Ikki marta bosish" bilan hamma narsa topiladi</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-blue-500 mx-auto mb-3 md:mb-4">
                <Cloud className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-sm md:text-base">Oflayn rejim</h3>
              <p className="text-xs md:text-sm text-gray-300">Internet o'chib qolsa ham tizim ishlayveradi</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-purple-500 mx-auto mb-3 md:mb-4">
                <Lock className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2 text-white text-sm md:text-base">Yuridik ishonch</h3>
              <p className="text-xs md:text-sm text-gray-300">O'zbekiston qonunchiligiga to'liq mos</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Institution Types */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-4 text-white">🏫 Barcha Muassasalar Uchun</h2>
          <p className="text-sm md:text-base text-gray-300">Modul arxitekturasi - "Lego" konstruktori</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-pink-500 mx-auto mb-2 md:mb-4">
                <Baby className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-white text-sm md:text-base">Bog'cha</h3>
              <p className="text-xs text-gray-300 hidden md:block">Yo'llanma, menyu, ovqat puli</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-green-500 mx-auto mb-2 md:mb-4">
                <School className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-white text-sm md:text-base">Maktab</h3>
              <p className="text-xs text-gray-300 hidden md:block">Baholar, reyting, davomat</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-blue-500 mx-auto mb-2 md:mb-4">
                <GraduationCap className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-white text-sm md:text-base">Texnikum</h3>
              <p className="text-xs text-gray-300 hidden md:block">Shartnoma, to'lov, qarzdorlik</p>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-0 backdrop-blur">
            <CardContent className="pt-4 md:pt-6 text-center">
              <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-purple-500 mx-auto mb-2 md:mb-4">
                <Building2 className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1 md:mb-2 text-white text-sm md:text-base">Universitet</h3>
              <p className="text-xs text-gray-300 hidden md:block">Kontrakt, kredit tizimi</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-8 md:py-16 text-center">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 border-0 max-w-2xl mx-auto">
          <CardContent className="pt-6 pb-6 md:pt-8 md:pb-8">
            <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white">🎯 "Ta'lim moliyasini raqamlashtiramiz!"</h2>
            <p className="text-sm md:text-base text-white/80 mb-4 md:mb-6 px-2">
              40% vaqt tejash • 50% to'lov intizomini yaxshilash • Bitta tizim - barcha ma'lumotlar
            </p>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-sm md:text-base">
                  <Play className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                  Demo ni boshlash
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-6 md:py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-xs md:text-sm">
          <p>© 2025 Ta'lim Moliyaviy Monitoring Tizimi</p>
          <p className="mt-1 md:mt-2">Barcha huquqlar himoyalangan</p>
        </div>
      </footer>
    </div>
  )
}
