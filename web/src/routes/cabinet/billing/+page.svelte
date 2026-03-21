<script lang="ts">
  import { TrendingUp } from 'lucide-svelte'
  import { formatCurrency, formatDate } from '$lib/utils'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const transactions = [
    { id: '1', orgName: 'Tibbiyot Texnikumi', amount: 1000000, date: '2025-01-01', type: 'subscription', status: 'paid' },
    { id: '2', orgName: 'IT Academy', amount: 500000, date: '2025-01-15', type: 'subscription', status: 'paid' },
    { id: '3', orgName: 'Fitness Club', amount: 2000000, date: '2025-01-10', type: 'subscription', status: 'pending' },
  ]

  const totalRevenue = transactions.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0)
</script>

<svelte:head><title>To'lovlar - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Billing</h1>
    <p class="text-muted-foreground">Platforma daromadlari va tranzaksiyalar</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami daromad (oylik)</CardTitle>
        <TrendingUp class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{formatCurrency(totalRevenue)}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kutilayotgan to'lovlar</CardTitle>
        <TrendingUp class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-yellow-600">
          {formatCurrency(transactions.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0))}
        </div>
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tashkilot</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Tur</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each transactions as tx}
            <TableRow>
              <TableCell class="font-medium">{tx.orgName}</TableCell>
              <TableCell>{formatCurrency(tx.amount)}</TableCell>
              <TableCell>{formatDate(tx.date)}</TableCell>
              <TableCell><Badge variant="secondary">{tx.type}</Badge></TableCell>
              <TableCell>
                {#if tx.status === 'paid'}
                  <Badge variant="success">To'landi</Badge>
                {:else}
                  <Badge variant="warning">Kutilmoqda</Badge>
                {/if}
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
