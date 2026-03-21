<script lang="ts">
  import { AlertTriangle, TrendingUp, Users, DollarSign } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import StatsCard from '$lib/components/dashboard/stats-card.svelte'
  import Spinner from '$lib/components/ui/spinner.svelte'

  interface Props {
    data: { stats: Record<string, number> | null }
  }
  let { data }: Props = $props()
  const stats = $derived(data.stats)
</script>

<svelte:head>
  <title>Dashboard - EduStatus</title>
</svelte:head>

<div class="space-y-6">
  <!-- Page Header -->
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Dashboard</h1>
    <p class="text-muted-foreground">Moliyaviy ko'rsatkichlar umumiy ko'rinishi</p>
  </div>

  {#if !stats}
    <div class="flex items-center justify-center h-64">
      <div class="text-center text-muted-foreground">
        <AlertTriangle class="h-8 w-8 mx-auto mb-2" />
        <p>Ma'lumotlar yuklanmadi</p>
      </div>
    </div>
  {:else}
    <!-- Stats Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Bugungi tushumlar"
        value={formatCurrency(stats.todayPayments || 0)}
        description="{stats.todayCount || 0} ta to'lov"
        icon={TrendingUp}
        trend={{ value: 12, isPositive: true }}
      />
      <StatsCard
        title="Oylik reja"
        value={formatCurrency(stats.monthlyActual || 0)}
        description="{stats.monthlyPercent || 0}% bajarilgan"
        icon={DollarSign}
        trend={{ value: 5, isPositive: true }}
      />
      <StatsCard
        title="Jami mijozlar"
        value={stats.totalClients || stats.totalStudents || 0}
        description="{stats.activeClients || stats.activeStudents || 0} ta faol"
        icon={Users}
      />
      <StatsCard
        title="Jami qarzdorlik"
        value={formatCurrency(stats.totalDebt || 0)}
        description="Barcha mijozlar"
        icon={AlertTriangle}
        class="border-yellow-200 bg-yellow-50"
      />
    </div>

    <!-- Placeholder Charts -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="rounded-lg border bg-card p-6">
        <h3 class="text-sm font-medium mb-4">Oylik tushumlar grafigi</h3>
        <div class="flex h-48 items-center justify-center text-muted-foreground text-sm">
          Grafik ma'lumotlari yuklanmoqda...
        </div>
      </div>
      <div class="rounded-lg border bg-card p-6">
        <h3 class="text-sm font-medium mb-4">To'lov usullari</h3>
        <div class="flex h-48 items-center justify-center text-muted-foreground text-sm">
          Grafik ma'lumotlari yuklanmoqda...
        </div>
      </div>
    </div>

    <!-- Monthly Progress -->
    <div class="rounded-lg border bg-card p-6">
      <h3 class="text-sm font-medium mb-4">Oylik reja bajarilishi</h3>
      <div class="space-y-2">
        <div class="flex items-center justify-between text-sm">
          <span>{formatCurrency(stats.monthlyActual || 0)}</span>
          <span class="text-muted-foreground">{formatCurrency(stats.monthlyPlan || 0)}</span>
        </div>
        <div class="h-3 w-full rounded-full bg-muted overflow-hidden">
          <div
            class="h-full bg-primary rounded-full transition-all"
            style="width: {Math.min(stats.monthlyPercent || 0, 100)}%"
          ></div>
        </div>
        <p class="text-xs text-muted-foreground">{stats.monthlyPercent || 0}% bajarildi</p>
      </div>
    </div>
  {/if}
</div>
