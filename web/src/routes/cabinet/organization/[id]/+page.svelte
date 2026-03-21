<script lang="ts">
  import { page } from '$app/stores'
  import { ArrowLeft, Building2 } from 'lucide-svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Button from '$lib/components/ui/button.svelte'

  const id = $derived($page.params.id)
</script>

<svelte:head><title>Tashkilot tafsiloti - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <a href="/cabinet/organization">
      <Button variant="ghost" size="icon">
        <ArrowLeft class="h-4 w-4" />
      </Button>
    </a>
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Tashkilot tafsiloti</h1>
      <p class="text-muted-foreground">ID: {id}</p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <Card>
      <CardHeader>
        <CardTitle class="flex items-center gap-2">
          <Building2 class="h-5 w-5" />
          Asosiy ma'lumotlar
        </CardTitle>
      </CardHeader>
      <CardContent class="space-y-3">
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Status</span>
          <Badge variant="success">Faol</Badge>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Tarif</span>
          <span class="text-sm font-medium">Pro</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Mijozlar</span>
          <span class="text-sm font-medium">320 ta</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Bo'limlar</span>
          <span class="text-sm font-medium">15 ta</span>
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader><CardTitle>Obuna ma'lumotlari</CardTitle></CardHeader>
      <CardContent class="space-y-3">
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Boshlanish</span>
          <span class="text-sm font-medium">2024-09-01</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Tugash</span>
          <span class="text-sm font-medium">2025-09-01</span>
        </div>
        <div class="flex justify-between">
          <span class="text-sm text-muted-foreground">Narxi</span>
          <span class="text-sm font-medium">1,000,000 so'm/oy</span>
        </div>
        <Button variant="outline" class="w-full mt-2">Tarifni o'zgartirish</Button>
      </CardContent>
    </Card>
  </div>
</div>
