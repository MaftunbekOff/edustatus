<script lang="ts">
  import { Building2, Plus, Search } from 'lucide-svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const organizations = [
    { id: '1', name: 'Tibbiyot Texnikumi', inn: '123456789', phone: '+998901111111', plan: 'pro', status: 'active', clients: 320, createdAt: '2024-09-01' },
    { id: '2', name: 'IT Academy', inn: '987654321', phone: '+998902222222', plan: 'basic', status: 'trial', clients: 150, createdAt: '2024-11-15' },
  ]

  let search = $state('')
  const filtered = $derived(organizations.filter((o) => o.name.toLowerCase().includes(search.toLowerCase())))
</script>

<svelte:head><title>Tashkilotlar - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Tashkilotlar</h1>
      <p class="text-muted-foreground">Barcha tashkilotlarni boshqarish</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Yangi tashkilot</Button>
  </div>

  <Card>
    <CardContent class="pt-6">
      <div class="flex gap-4 mb-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Tashkilot nomi bo'yicha qidirish..." bind:value={search} class="pl-10" />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>INN</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Tarif</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mijozlar</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each filtered as org}
            <TableRow>
              <TableCell class="font-medium">{org.name}</TableCell>
              <TableCell class="font-mono text-sm">{org.inn}</TableCell>
              <TableCell>{org.phone}</TableCell>
              <TableCell class="capitalize">{org.plan}</TableCell>
              <TableCell>
                {#if org.status === 'active'}
                  <Badge variant="success">Faol</Badge>
                {:else}
                  <Badge variant="warning">Sinov</Badge>
                {/if}
              </TableCell>
              <TableCell>{org.clients}</TableCell>
              <TableCell class="text-right">
                <a href="/cabinet/organization/{org.id}">
                  <Button variant="ghost" size="sm">Ko'rish</Button>
                </a>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
