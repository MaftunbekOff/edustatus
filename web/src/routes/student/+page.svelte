<script lang="ts">
  import { GraduationCap, CreditCard, Bell, TrendingUp } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Badge from '$lib/components/ui/badge.svelte'

  const student = {
    fullName: 'Karimov Bobur Rahimovich', group: '101-A', specialty: 'Tibbiyot',
    contractNumber: 'SH-2025-003', totalAmount: 12000000, paidAmount: 7000000,
    debtAmount: 5000000, attendance: 92,
  }
</script>

<svelte:head><title>Talaba Portali - EduStatus</title></svelte:head>

<div class="min-h-screen bg-gray-50">
  <header class="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <GraduationCap class="h-6 w-6" />
          </div>
          <div>
            <h1 class="font-semibold">{student.fullName}</h1>
            <p class="text-sm text-white/80">Talaba portali</p>
          </div>
        </div>
        <a href="/login">
          <Button variant="ghost" class="text-white hover:bg-white/20">Chiqish</Button>
        </a>
      </div>
    </div>
  </header>

  <main class="container mx-auto px-4 py-6 space-y-6">
    <div class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardContent class="pt-6">
          <p class="text-sm text-muted-foreground">Shartnoma</p>
          <p class="font-semibold">{student.contractNumber}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <p class="text-sm text-muted-foreground">Guruh</p>
          <p class="font-semibold">{student.group}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <p class="text-sm text-muted-foreground">Qarz</p>
          <p class="text-xl font-bold text-red-600">{formatCurrency(student.debtAmount)}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent class="pt-6">
          <p class="text-sm text-muted-foreground">Davomat</p>
          <p class="text-xl font-bold text-purple-600">{student.attendance}%</p>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader><CardTitle>To'lov holati</CardTitle></CardHeader>
      <CardContent>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span>To'langan: <strong class="text-green-600">{formatCurrency(student.paidAmount)}</strong></span>
            <span>Qolgan: <strong class="text-red-600">{formatCurrency(student.debtAmount)}</strong></span>
          </div>
          <div class="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div class="h-full bg-primary rounded-full" style="width: {Math.round((student.paidAmount / student.totalAmount) * 100)}%"></div>
          </div>
          <p class="text-xs text-muted-foreground">{Math.round((student.paidAmount / student.totalAmount) * 100)}% to'langan</p>
        </div>
        <div class="mt-4 flex gap-3">
          <a href="/student/payment">
            <Button><CreditCard class="mr-2 h-4 w-4" />To'lov qilish</Button>
          </a>
          <a href="/student/notifications">
            <Button variant="outline"><Bell class="mr-2 h-4 w-4" />Bildirishnomalar</Button>
          </a>
        </div>
      </CardContent>
    </Card>
  </main>
</div>
