<script lang="ts">
  import { page } from '$app/stores'
  import { ArrowLeft } from 'lucide-svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Badge from '$lib/components/ui/badge.svelte'

  const id = $derived($page.params.id)
</script>

<svelte:head><title>Xodim tafsiloti - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/dashboard/hr">
      <Button variant="ghost" size="icon"><ArrowLeft class="h-4 w-4" /></Button>
    </a>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Xodim tafsiloti</h1>
      <p class="text-muted-foreground">ID: {id}</p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader><CardTitle>Shaxsiy ma'lumotlar</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <div class="flex justify-between"><span class="text-sm text-muted-foreground">Status</span><Badge variant="success">Faol</Badge></div>
        <div class="flex justify-between"><span class="text-sm text-muted-foreground">Lavozim</span><span class="text-sm font-medium">Buxgalter</span></div>
        <div class="flex justify-between"><span class="text-sm text-muted-foreground">Bo'lim</span><span class="text-sm font-medium">Moliya</span></div>
        <div class="flex justify-between"><span class="text-sm text-muted-foreground">Maosh</span><span class="text-sm font-medium">3,500,000 so'm</span></div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader><CardTitle>Davomat statistikasi</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <div class="flex justify-between"><span class="text-sm text-muted-foreground">Bu oy</span><span class="text-sm font-medium">22/23 kun</span></div>
        <div class="flex justify-between"><span class="text-sm text-muted-foreground">Foiz</span><span class="text-sm font-medium text-green-600">95.6%</span></div>
      </CardContent>
    </Card>
  </div>
</div>
