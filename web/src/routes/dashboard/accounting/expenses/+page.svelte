<script lang="ts">
  import { Receipt, Plus } from 'lucide-svelte'
  import { formatCurrency, formatDate } from '$lib/utils'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const expenses = [
    { id: '1', description: "Kommunal to'lovlar", amount: 500000, date: '2025-01-10', category: 'utilities', status: 'paid' },
    { id: '2', description: "Internet va telefon", amount: 300000, date: '2025-01-12', category: 'communication', status: 'paid' },
    { id: '3', description: 'Ofis jihozlari', amount: 1200000, date: '2025-01-15', category: 'equipment', status: 'pending' },
  ]
</script>

<svelte:head><title>Xarajatlar - Buxgalteriya</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Xarajatlar</h1>
      <p class="text-muted-foreground">Tashkilot xarajatlarini boshqarish</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Xarajat qo'shish</Button>
  </div>
  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ta'rif</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Kategoriya</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each expenses as exp}
            <TableRow>
              <TableCell class="font-medium">{exp.description}</TableCell>
              <TableCell>{formatCurrency(exp.amount)}</TableCell>
              <TableCell>{formatDate(exp.date)}</TableCell>
              <TableCell><Badge variant="secondary">{exp.category}</Badge></TableCell>
              <TableCell>
                {#if exp.status === 'paid'}
                  <Badge variant="success">To'landi</Badge>
                {:else}
                  <Badge variant="warning">Kutilmoqda</Badge>
                {/if}
              </TableCell>
              <TableCell class="text-right"><Button variant="ghost" size="sm">Ko'rish</Button></TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
