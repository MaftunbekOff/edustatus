<script lang="ts">
  import {
    GraduationCap, Users, CreditCard, AlertTriangle, Shield, Bell,
    QrCode, FileText, CheckCircle, Zap, Cloud, Lock, Baby, School,
    Building2, ArrowRight, Play, BarChart3,
  } from 'lucide-svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'

  const problems = [
    { icon: Users, title: '"O\'lik jonlar"', description: "Qog'ozda bor, lekin amalda yo'q o'quvchilar", solution: "PINFL orqali dublikat aniqlash", iconBg: 'bg-red-500' },
    { icon: CreditCard, title: '"Pulingiz yetib kelmadi"', description: "Ota-ona to'laydi, buxgalter ko'rmaydi", solution: 'Avtomatik bank biriktirish', iconBg: 'bg-yellow-500' },
    { icon: AlertTriangle, title: '"Kechikkan to\'lovlar"', description: "O'qituvchilarga oylik berilmaydi", solution: 'SMS/Telegram eslatmalar', iconBg: 'bg-orange-500' },
    { icon: Building2, title: 'Turli muassasalar', description: "Bog'cha, maktab, texnikum - har xil", solution: 'Modul arxitekturasi', iconBg: 'bg-blue-500' },
  ]

  const features = [
    { icon: Shield, title: 'PINFL dublikat', href: '/dashboard/duplicates', iconBg: 'bg-red-500' },
    { icon: CreditCard, title: 'Auto-reconciliation', href: '/dashboard/bank', iconBg: 'bg-yellow-500' },
    { icon: Bell, title: 'SMS/Telegram', href: '/dashboard/reminders', iconBg: 'bg-orange-500' },
    { icon: QrCode, title: 'QR davomat', href: '/dashboard/attendance', iconBg: 'bg-purple-500' },
    { icon: FileText, title: 'Shartnomalar', href: '/dashboard/contracts', iconBg: 'bg-blue-500' },
    { icon: Users, title: 'Yagona Login', href: '/parent', iconBg: 'bg-green-500' },
  ]

  const stats = [
    { value: '10,000+', label: "Ta'lim muassasalari" },
    { value: '5M+', label: 'Talabalar' },
    { value: '25T', label: 'Bozor hajmi (so\'m/yil)' },
    { value: '40%', label: 'Vaqt tejash' },
  ]

  const pricing = [
    { name: 'Basic', price: '500,000', students: '100 ta', popular: false },
    { name: 'Pro', price: '1,000,000', students: '500 ta', popular: true },
    { name: 'Enterprise', price: '2,000,000', students: 'Cheksiz', popular: false },
  ]

  const demoLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'Talabalar', href: '/dashboard/students', icon: Users },
    { name: "To'lovlar", href: '/dashboard/payments', icon: CreditCard },
    { name: 'Qarzdorlar', href: '/dashboard/debtors', icon: AlertTriangle },
    { name: 'Dublikatlar', href: '/dashboard/duplicates', icon: Shield },
    { name: 'Bank reestr', href: '/dashboard/bank', icon: FileText },
    { name: 'Eslatmalar', href: '/dashboard/reminders', icon: Bell },
    { name: 'Davomat', href: '/dashboard/attendance', icon: QrCode },
    { name: 'Ota-ona', href: '/parent', icon: Users },
    { name: 'Cabinet', href: '/cabinet', icon: Building2 },
  ]
</script>

<svelte:head>
  <title>EduStatus - Moliyaviy Monitoring Tizimi</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
  <!-- Hero -->
  <section class="container mx-auto px-4 py-8 md:py-16 text-center">
    <Badge class="mb-4 bg-purple-500 text-white border-0 text-xs md:text-sm">
      🎯 Ta'lim Muassasalari uchun
    </Badge>
    <h1 class="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white leading-tight">
      Moliyaviy Monitoring Tizimi
    </h1>
    <p class="text-base md:text-xl text-gray-300 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
      O'zbekistondagi ta'lim muassasalarida moliyaviy jarayonlarni raqamlashtirish
    </p>
    <div class="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 px-4">
      <a href="/dashboard" class="w-full sm:w-auto">
        <Button size="lg" class="w-full bg-purple-600 hover:bg-purple-700 text-white">
          <Play class="mr-2 h-5 w-5" />
          Demo ni ko'rish
        </Button>
      </a>
      <a href="#features" class="w-full sm:w-auto">
        <Button size="lg" class="w-full bg-white/10 text-white hover:bg-white/20 border border-white/30">
          Batafsil
          <ArrowRight class="ml-2 h-5 w-5" />
        </Button>
      </a>
    </div>
  </section>

  <!-- Stats -->
  <section class="container mx-auto px-4 py-8">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      {#each stats as stat}
        <Card class="bg-white/10 border-0 backdrop-blur">
          <CardContent class="pt-6 text-center">
            <p class="text-3xl font-bold text-white">{stat.value}</p>
            <p class="text-sm text-gray-300">{stat.label}</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Problems -->
  <section class="container mx-auto px-4 py-8 md:py-16" id="problems">
    <div class="text-center mb-8 md:mb-12">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white">❌ "Xalq Muammosi"</h2>
      <p class="text-sm md:text-base text-gray-300">Real muammolar va ularning yechimlari</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {#each problems as problem}
        <Card class="bg-white/10 border-0 backdrop-blur hover:bg-white/15 transition-all">
          <CardContent class="pt-6">
            <div class="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full mb-3 {problem.iconBg}">
              <problem.icon class="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 class="font-semibold text-base md:text-lg mb-2 text-white">{problem.title}</h3>
            <p class="text-xs md:text-sm text-gray-300 mb-3">{problem.description}</p>
            <div class="flex items-center gap-2">
              <CheckCircle class="h-3 w-3 md:h-4 md:w-4 text-green-400" />
              <span class="text-xs md:text-sm text-green-400">{problem.solution}</span>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Features -->
  <section class="container mx-auto px-4 py-16" id="features">
    <div class="text-center mb-12">
      <h2 class="text-3xl font-bold mb-4 text-white">✅ Asosiy Funksiyalar</h2>
      <p class="text-gray-300">Bosing va demo ko'ring</p>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {#each features as feature}
        <a href={feature.href}>
          <Card class="bg-white/10 border-0 backdrop-blur hover:bg-white/20 transition-all cursor-pointer h-full">
            <CardContent class="pt-6 text-center">
              <div class="flex h-12 w-12 items-center justify-center rounded-full mx-auto mb-3 {feature.iconBg}">
                <feature.icon class="h-6 w-6 text-white" />
              </div>
              <p class="font-medium text-sm text-white">{feature.title}</p>
            </CardContent>
          </Card>
        </a>
      {/each}
    </div>
  </section>

  <!-- Demo Links -->
  <section class="container mx-auto px-4 py-8 md:py-16">
    <div class="text-center mb-8 md:mb-12">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white">🎬 Demo Sahifalar</h2>
      <p class="text-sm md:text-base text-gray-300">Barcha sahifalarni sinab ko'ring</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3">
      {#each demoLinks as link}
        <a href={link.href}>
          <Button class="w-full bg-white/10 text-white hover:bg-white/20 border border-white/20 text-xs md:text-sm h-10">
            <link.icon class="mr-1 md:mr-2 h-3 w-3 md:h-4 md:w-4" />
            {link.name}
          </Button>
        </a>
      {/each}
    </div>
  </section>

  <!-- Pricing -->
  <section class="container mx-auto px-4 py-8 md:py-16" id="pricing">
    <div class="text-center mb-8 md:mb-12">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white">💰 Tariflar</h2>
      <p class="text-sm md:text-base text-gray-300">Oylik obuna to'lovi</p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
      {#each pricing as plan}
        <Card class="{plan.popular ? 'bg-purple-600 border-0 sm:scale-105' : 'bg-white/10 border-0'} backdrop-blur">
          <CardContent class="pt-6 text-center">
            {#if plan.popular}
              <Badge class="mb-4 bg-white text-purple-600">Mashhur</Badge>
            {/if}
            <h3 class="text-lg md:text-xl font-bold mb-2 text-white">{plan.name}</h3>
            <p class="text-2xl md:text-3xl font-bold mb-1 text-white">{plan.price}</p>
            <p class="text-xs md:text-sm text-gray-300 mb-4">so'm / oy</p>
            <p class="text-xs md:text-sm text-gray-200">{plan.students} talaba</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  </section>

  <!-- Advantages -->
  <section class="container mx-auto px-4 py-8 md:py-16">
    <div class="text-center mb-8 md:mb-12">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white">🏆 Afzalliklar</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <Card class="bg-white/10 border-0 backdrop-blur">
        <CardContent class="pt-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 mx-auto mb-4">
            <Zap class="h-6 w-6 text-white" />
          </div>
          <h3 class="font-semibold mb-2 text-white">Soddalik</h3>
          <p class="text-sm text-gray-300">Buxgalter IT-mutaxassis emas. "Ikki marta bosish" bilan hamma narsa topiladi</p>
        </CardContent>
      </Card>
      <Card class="bg-white/10 border-0 backdrop-blur">
        <CardContent class="pt-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 mx-auto mb-4">
            <Cloud class="h-6 w-6 text-white" />
          </div>
          <h3 class="font-semibold mb-2 text-white">Oflayn rejim</h3>
          <p class="text-sm text-gray-300">Internet o'chib qolsa ham tizim ishlayveradi</p>
        </CardContent>
      </Card>
      <Card class="bg-white/10 border-0 backdrop-blur">
        <CardContent class="pt-6 text-center">
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 mx-auto mb-4">
            <Lock class="h-6 w-6 text-white" />
          </div>
          <h3 class="font-semibold mb-2 text-white">Yuridik ishonch</h3>
          <p class="text-sm text-gray-300">O'zbekiston qonunchiligiga to'liq mos</p>
        </CardContent>
      </Card>
    </div>
  </section>

  <!-- Institution Types -->
  <section class="container mx-auto px-4 py-8 md:py-16">
    <div class="text-center mb-8 md:mb-12">
      <h2 class="text-2xl md:text-3xl font-bold mb-2 text-white">🏫 Barcha Muassasalar Uchun</h2>
    </div>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
      {#each [
        { icon: Baby, bg: 'bg-pink-500', name: "Bog'cha", desc: "Yo'llanma, menyu, ovqat puli" },
        { icon: School, bg: 'bg-green-500', name: 'Maktab', desc: 'Baholar, reyting, davomat' },
        { icon: GraduationCap, bg: 'bg-blue-500', name: 'Texnikum', desc: "Shartnoma, to'lov, qarzdorlik" },
        { icon: Building2, bg: 'bg-purple-500', name: 'Universitet', desc: 'Kontrakt, kredit tizimi' },
      ] as inst}
        <Card class="bg-white/10 border-0 backdrop-blur">
          <CardContent class="pt-4 md:pt-6 text-center">
            <div class="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full {inst.bg} mx-auto mb-2 md:mb-4">
              <inst.icon class="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <h3 class="font-semibold mb-1 text-white text-sm md:text-base">{inst.name}</h3>
            <p class="text-xs text-gray-300 hidden md:block">{inst.desc}</p>
          </CardContent>
        </Card>
      {/each}
    </div>
  </section>

  <!-- CTA -->
  <section class="container mx-auto px-4 py-8 md:py-16 text-center">
    <Card class="bg-gradient-to-r from-purple-600 to-blue-600 border-0 max-w-2xl mx-auto">
      <CardContent class="pt-6 pb-6 md:pt-8 md:pb-8">
        <h2 class="text-xl md:text-2xl font-bold mb-3 text-white">🎯 "Ta'lim moliyasini raqamlashtiramiz!"</h2>
        <p class="text-sm md:text-base text-white/80 mb-4 px-2">
          40% vaqt tejash • 50% to'lov intizomini yaxshilash • Bitta tizim - barcha ma'lumotlar
        </p>
        <a href="/dashboard">
          <Button size="lg" class="bg-white text-purple-600 hover:bg-gray-100">
            <Play class="mr-2 h-5 w-5" />
            Demo ni boshlash
          </Button>
        </a>
      </CardContent>
    </Card>
  </section>

  <!-- Footer -->
  <footer class="border-t border-white/10 py-6 md:py-8">
    <div class="container mx-auto px-4 text-center text-gray-400 text-sm">
      <p>© 2025 Ta'lim Moliyaviy Monitoring Tizimi</p>
      <p class="mt-1">Barcha huquqlar himoyalangan</p>
    </div>
  </footer>
</div>
