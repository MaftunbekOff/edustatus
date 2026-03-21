<script lang="ts">
  import { Users, GraduationCap, AlertTriangle, TrendingUp, CreditCard, Bell, Calendar, MessageSquare, Download } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Badge from '$lib/components/ui/badge.svelte'

  const parent = { fullName: "Aliyev Anvar Abdullaevich", phone: '+998901234567' }
  const children = [
    {
      id: '1', fullName: "Aliyeva Malika", group: '101-A', specialty: 'Tibbiyot', college: 'Tibbiyot Texnikumi',
      contractNumber: 'SH-2025-001', totalAmount: 12000000, paidAmount: 8000000, debtAmount: 4000000,
      nextPaymentDate: '2025-02-01', status: 'active', attendance: 95,
    },
  ]
  const notifications = [
    { id: '1', message: "2025-02-01 gacha 4,000,000 so'm to'lov muddati yaqinlashmoqda", type: 'payment', date: '2025-01-25', isRead: false },
    { id: '2', message: "Yanvar oyida 95% davomat", type: 'attendance', date: '2025-01-20', isRead: true },
  ]

  const summary = {
    totalChildren: children.length,
    activeChildren: children.filter((c) => c.status === 'active').length,
    totalPaid: children.reduce((s, c) => s + c.paidAmount, 0),
    totalDebt: children.reduce((s, c) => s + c.debtAmount, 0),
  }
</script>

<svelte:head><title>Ota-ona Portali - EduStatus</title></svelte:head>

<div class="min-h-screen bg-gray-50">
  <!-- Header -->
  <header class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Users class="h-6 w-6" />
          </div>
          <div>
            <h1 class="font-semibold">{parent.fullName.split(' ')[0]}lar Oilasi</h1>
            <p class="text-sm text-white/80">Yagona Ta'lim Portali</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <Button variant="ghost" class="text-white hover:bg-white/20 relative">
            <Bell class="h-5 w-5" />
            <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px]">
              {notifications.filter((n) => !n.isRead).length}
            </span>
          </Button>
          <a href="/login">
            <Button variant="ghost" class="text-white hover:bg-white/20">Chiqish</Button>
          </a>
        </div>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-4 py-6">
    <!-- Welcome Card -->
    <Card class="mb-6 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardContent class="pt-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-xl font-bold text-indigo-800">Xush kelibsiz, {parent.fullName.split(' ')[0]}!</h2>
            <p class="text-indigo-600 mt-1">Sizning {summary.totalChildren} ta farzandingiz ro'yxatda turibdi</p>
          </div>
          <div class="hidden md:flex items-center gap-4">
            <div class="text-right">
              <p class="text-sm text-muted-foreground">Jami to'langan</p>
              <p class="text-lg font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-muted-foreground">Qarz</p>
              <p class="text-lg font-bold text-red-600">{formatCurrency(summary.totalDebt)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Stats -->
    <div class="grid gap-4 md:grid-cols-4 mb-6">
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <GraduationCap class="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Talabalar</p>
              <p class="text-2xl font-bold">{summary.totalChildren}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <AlertTriangle class="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Qarz</p>
              <p class="text-xl font-bold text-yellow-600">{formatCurrency(summary.totalDebt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <TrendingUp class="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Davomat</p>
              <p class="text-2xl font-bold text-purple-600">95%</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CreditCard class="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p class="text-sm text-muted-foreground">To'langan</p>
              <p class="text-xl font-bold text-green-600">{formatCurrency(summary.totalPaid)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Children -->
    <h3 class="text-lg font-semibold mb-4">Farzandlarim</h3>
    <div class="grid gap-6 lg:grid-cols-3 mb-6">
      {#each children as child}
        <Card>
          <CardContent class="pt-6">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h4 class="font-semibold">{child.fullName}</h4>
                <p class="text-sm text-muted-foreground">{child.college}</p>
              </div>
              <Badge variant="success">Faol</Badge>
            </div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span class="text-muted-foreground">Guruh</span><span>{child.group}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Shartnoma</span><span>{child.contractNumber}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Jami</span><span>{formatCurrency(child.totalAmount)}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">To'langan</span><span class="text-green-600">{formatCurrency(child.paidAmount)}</span></div>
              <div class="flex justify-between"><span class="text-muted-foreground">Qarz</span><span class="text-red-600 font-semibold">{formatCurrency(child.debtAmount)}</span></div>
            </div>
            <div class="mt-3">
              <div class="h-2 w-full rounded-full bg-muted overflow-hidden">
                <div class="h-full bg-primary rounded-full" style="width: {Math.round((child.paidAmount / child.totalAmount) * 100)}%"></div>
              </div>
              <p class="text-xs text-muted-foreground mt-1">{Math.round((child.paidAmount / child.totalAmount) * 100)}% to'langan</p>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>

    <!-- Two Column -->
    <div class="grid gap-6 lg:grid-cols-2">
      <!-- Notifications -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <CardTitle class="text-lg">So'nggi bildirishnomalar</CardTitle>
            <Button variant="ghost" size="sm">Barchasi</Button>
          </div>
        </CardHeader>
        <CardContent class="space-y-3">
          {#each notifications as notif}
            <div class="flex items-start gap-3 p-3 rounded-lg {notif.isRead ? 'bg-muted/50' : 'bg-blue-50 border border-blue-200'}">
              <Bell class="h-4 w-4 mt-0.5 {notif.isRead ? 'text-muted-foreground' : 'text-blue-500'}" />
              <div class="flex-1">
                <p class="text-sm">{notif.message}</p>
                <p class="text-xs text-muted-foreground">{notif.date}</p>
              </div>
            </div>
          {/each}
        </CardContent>
      </Card>

      <!-- Quick Actions -->
      <Card>
        <CardHeader><CardTitle class="text-lg">Tezkor amallar</CardTitle></CardHeader>
        <CardContent>
          <div class="grid gap-3 grid-cols-2">
            <Button variant="outline" class="h-auto py-4 flex-col gap-2">
              <CreditCard class="h-6 w-6 text-green-600" />
              <span>To'lov qilish</span>
            </Button>
            <Button variant="outline" class="h-auto py-4 flex-col gap-2">
              <Download class="h-6 w-6 text-blue-600" />
              <span>Kvitansiya</span>
            </Button>
            <Button variant="outline" class="h-auto py-4 flex-col gap-2">
              <MessageSquare class="h-6 w-6 text-purple-600" />
              <span>Murojaat</span>
            </Button>
            <Button variant="outline" class="h-auto py-4 flex-col gap-2">
              <Calendar class="h-6 w-6 text-orange-600" />
              <span>Dars jadvali</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </main>

  <footer class="bg-gray-100 py-4 mt-8">
    <div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
      © 2025 Yagona Ta'lim Portali. Barcha huquqlar himoyalangan.
    </div>
  </footer>
</div>
