<script lang="ts">
  import { Calculator, TrendingUp, TrendingDown, Receipt } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
</script>

<svelte:head><title>Buxgalteriya - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Buxgalteriya</h1>
    <p class="text-muted-foreground">Moliyaviy hisobot va buxgalteriya boshqaruvi</p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Oylik daromad</CardTitle>
        <TrendingUp class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-green-600">{formatCurrency(45000000)}</div>
        <p class="text-xs text-muted-foreground">+12% o'tgan oydan</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Oylik xarajatlar</CardTitle>
        <TrendingDown class="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-red-600">{formatCurrency(28000000)}</div>
        <p class="text-xs text-muted-foreground">-3% o'tgan oydan</p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Sof foyda</CardTitle>
        <Calculator class="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-blue-600">{formatCurrency(17000000)}</div>
        <p class="text-xs text-muted-foreground">Bu oy</p>
      </CardContent>
    </Card>
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader><CardTitle>Tezkor havolalar</CardTitle></CardHeader>
      <CardContent class="flex flex-col gap-3">
        <a href="/dashboard/accounting/expenses">
          <Button variant="outline" class="w-full justify-start">
            <Receipt class="mr-2 h-4 w-4" />
            Xarajatlar ro'yxati
          </Button>
        </a>
        <a href="/dashboard/accounting/taxes">
          <Button variant="outline" class="w-full justify-start">
            <Calculator class="mr-2 h-4 w-4" />
            Soliq hisobotlari
          </Button>
        </a>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Bu oy statistikasi</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">To'lovlar</span>
          <span class="font-medium">45 ta</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Xarajatlar</span>
          <span class="font-medium">23 ta</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-muted-foreground">Qarzdorlar</span>
          <span class="font-medium text-red-600">12 ta</span>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
