<script lang="ts">
  import { Calculator } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
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

  const taxes = [
    { id: '1', type: "QQS (VAT 15%)", period: '2025 Q1', amount: 3200000, dueDate: '2025-04-20', status: 'pending' },
    { id: '2', type: "Daromad solig'i", period: '2024 Q4', amount: 1800000, dueDate: '2025-01-20', status: 'paid' },
    { id: '3', type: 'Ijtimoiy sug\'urta', period: '2025 Yanvar', amount: 950000, dueDate: '2025-02-15', status: 'pending' },
  ]
</script>

<svelte:head><title>Soliqlar - Buxgalteriya</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Soliq Hisobotlari</h1>
    <p class="text-muted-foreground">Soliq to'lovlari va hisobot muddat nazorati</p>
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kutilayotgan soliqlar</CardTitle>
        <Calculator class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-yellow-600">
          {formatCurrency(taxes.filter((t) => t.status === 'pending').reduce((s, t) => s + t.amount, 0))}
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">To'langan (bu yil)</CardTitle>
        <Calculator class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-green-600">
          {formatCurrency(taxes.filter((t) => t.status === 'paid').reduce((s, t) => s + t.amount, 0))}
        </div>
      </CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Soliq turi</TableHead>
            <TableHead>Davr</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Muddati</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each taxes as tax}
            <TableRow>
              <TableCell class="font-medium">{tax.type}</TableCell>
              <TableCell>{tax.period}</TableCell>
              <TableCell>{formatCurrency(tax.amount)}</TableCell>
              <TableCell>{tax.dueDate}</TableCell>
              <TableCell>
                {#if tax.status === 'paid'}
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
