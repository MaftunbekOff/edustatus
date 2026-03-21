<script lang="ts">
  import { Building2, Users, CreditCard, TrendingUp, Activity } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const organizations = [
    { id: '1', name: 'Tibbiyot Texnikumi', type: 'college', plan: 'pro', status: 'active', clients: 320 },
    { id: '2', name: 'IT Academy', type: 'training_center', plan: 'basic', status: 'trial', clients: 150 },
    { id: '3', name: 'Fitness Club', type: 'fitness_center', plan: 'enterprise', status: 'active', clients: 500 },
  ]
</script>

<svelte:head><title>Cabinet Dashboard - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Cabinet Dashboard</h1>
      <p class="text-muted-foreground">Barcha tashkilotlar bo'yicha umumiy statistika</p>
    </div>
    <div class="flex gap-2">
      <Button variant="outline">
        <Activity class="mr-2 h-4 w-4" />
        Hisobot
      </Button>
      <Button>
        <Building2 class="mr-2 h-4 w-4" />
        Yangi tashkilot
      </Button>
    </div>
  </div>

  <div class="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami tashkilotlar</CardTitle>
        <Building2 class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{organizations.length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Faol</CardTitle>
        <TrendingUp class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{organizations.filter((o) => o.status === 'active').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami mijozlar</CardTitle>
        <Users class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{organizations.reduce((s, o) => s + o.clients, 0)}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Oylik daromad</CardTitle>
        <CreditCard class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{formatCurrency(3500000)}</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardHeader><CardTitle>Tashkilotlar ro'yxati</CardTitle></CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Tur</TableHead>
            <TableHead>Tarif</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mijozlar</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each organizations as org}
            <TableRow>
              <TableCell class="font-medium">{org.name}</TableCell>
              <TableCell><Badge variant="secondary">{org.type}</Badge></TableCell>
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
