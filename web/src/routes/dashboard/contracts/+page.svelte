<script lang="ts">
  import { FileSignature, Plus } from 'lucide-svelte'
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

  const contracts = [
    { id: '1', contractNumber: 'SH-2025-001', studentName: 'Aliyev Anvar', amount: 12000000, signDate: '2025-09-01', endDate: '2026-07-01', status: 'active' },
    { id: '2', contractNumber: 'SH-2025-002', studentName: 'Valiyeva Dilnoza', amount: 12000000, signDate: '2025-09-01', endDate: '2026-07-01', status: 'active' },
    { id: '3', contractNumber: 'SH-2024-050', studentName: 'Rahimov Jahongir', amount: 10000000, signDate: '2024-09-01', endDate: '2025-07-01', status: 'completed' },
  ]
</script>

<svelte:head><title>Shartnomalar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Shartnomalar</h1>
      <p class="text-muted-foreground">O'quv shartnomalarini boshqarish</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Shartnoma qo'shish</Button>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shartnoma №</TableHead>
            <TableHead>Talaba</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Imzolangan</TableHead>
            <TableHead>Tugash sanasi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each contracts as contract}
            <TableRow>
              <TableCell class="font-mono">{contract.contractNumber}</TableCell>
              <TableCell class="font-medium">{contract.studentName}</TableCell>
              <TableCell>{formatCurrency(contract.amount)}</TableCell>
              <TableCell>{formatDate(contract.signDate)}</TableCell>
              <TableCell>{formatDate(contract.endDate)}</TableCell>
              <TableCell>
                {#if contract.status === 'active'}
                  <Badge variant="success">Faol</Badge>
                {:else}
                  <Badge variant="secondary">Yakunlangan</Badge>
                {/if}
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm">Ko'rish</Button>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
