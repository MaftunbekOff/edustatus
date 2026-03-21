<script lang="ts">
  import { Save } from 'lucide-svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import CardDescription from '$lib/components/ui/card-description.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
</script>

<svelte:head><title>Sozlamalar - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Platforma Sozlamalari</h1>
    <p class="text-muted-foreground">SaaS platform konfiguratsiyasi</p>
  </div>

  <Card>
    <CardHeader>
      <CardTitle>Umumiy sozlamalar</CardTitle>
      <CardDescription>Platforma asosiy konfiguratsiyasi</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="platform-name">Platforma nomi</label>
        <Input id="platform-name" value="EduStatus" placeholder="Platforma nomi" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="platform-domain">Asosiy domain</label>
        <Input id="platform-domain" value="edustatus.uz" placeholder="domain.uz" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="platform-email">Aloqa email</label>
        <Input id="platform-email" type="email" value="support@edustatus.uz" placeholder="support@example.uz" />
      </div>
      <Button><Save class="mr-2 h-4 w-4" />Saqlash</Button>
    </CardContent>
  </Card>
</div>
