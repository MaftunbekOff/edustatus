<script lang="ts">
  import { FileText, Download, TrendingUp } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'

  const reports = [
    { id: '1', title: "Oylik to'lov hisoboti", period: '2025 Yanvar', revenue: 45000000 },
    { id: '2', title: 'Qarzdorlik hisoboti', period: '2025 Yanvar', revenue: 12500000 },
    { id: '3', title: "Talabalar statistikasi", period: '2025 Yanvar', revenue: 0 },
  ]
</script>

<svelte:head><title>Hisobotlar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Hisobotlar</h1>
    <p class="text-muted-foreground">Moliyaviy va statistik hisobotlar</p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    {#each reports as report}
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{report.title}</CardTitle>
          <FileText class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-xl font-bold">{report.period}</div>
          {#if report.revenue > 0}
            <p class="text-sm text-muted-foreground">{formatCurrency(report.revenue)}</p>
          {/if}
          <Button variant="outline" size="sm" class="mt-3 w-full">
            <Download class="mr-2 h-4 w-4" />
            Yuklab olish
          </Button>
        </CardContent>
      </Card>
    {/each}
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Yillik ko'rsatkichlar</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex h-64 items-center justify-center text-muted-foreground">
        <div class="text-center">
          <TrendingUp class="h-12 w-12 mx-auto mb-2" />
          <p>Grafik tez orada qo'shiladi</p>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
