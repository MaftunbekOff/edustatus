<script lang="ts">
  import { Settings, Save } from 'lucide-svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import CardDescription from '$lib/components/ui/card-description.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'

  let orgName = $state('')
  let phone = $state('')
  let email = $state('')
  let address = $state('')
</script>

<svelte:head><title>Sozlamalar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Sozlamalar</h1>
    <p class="text-muted-foreground">Tashkilot sozlamalari va konfiguratsiya</p>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Tashkilot ma'lumotlari</CardTitle>
      <CardDescription>Asosiy ma'lumotlarni yangilang</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="org-name">Tashkilot nomi</label>
        <Input id="org-name" bind:value={orgName} placeholder="Tashkilot nomini kiriting" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="org-phone">Telefon</label>
        <Input id="org-phone" bind:value={phone} placeholder="+998 XX XXX XX XX" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="org-email">Email</label>
        <Input id="org-email" type="email" bind:value={email} placeholder="email@example.com" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="org-address">Manzil</label>
        <Input id="org-address" bind:value={address} placeholder="To'liq manzil" />
      </div>
      <Button>
        <Save class="mr-2 h-4 w-4" />
        Saqlash
      </Button>
    </CardContent>
  </Card>
</div>
