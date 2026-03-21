<script lang="ts">
  import { FileText, CheckCircle, Clock, Upload } from 'lucide-svelte'
  import { formatCurrency, formatDate } from '$lib/utils'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const records = [
    { id: '1', transactionId: 'TXN-001', studentName: 'Aliyev Anvar', amount: 1500000, date: '2025-01-15', status: 'matched' },
    { id: '2', transactionId: 'TXN-002', studentName: null, amount: 800000, date: '2025-01-15', status: 'unmatched' },
    { id: '3', transactionId: 'TXN-003', studentName: 'Karimov Bobur', amount: 1000000, date: '2025-01-14', status: 'matched' },
  ]
</script>

<svelte:head><title>Bank Reestr - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Bank Reestr</h1>
      <p class="text-muted-foreground">Bank tranzaksiyalarini tahlil qilish va biriktirish</p>
    </div>
    <Button><Upload class="mr-2 h-4 w-4" />Reestr yuklash</Button>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami tranzaksiyalar</CardTitle>
        <FileText class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{records.length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Biriktirilgan</CardTitle>
        <CheckCircle class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{records.filter((r) => r.status === 'matched').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Biriktirilmagan</CardTitle>
        <Clock class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-yellow-600">{records.filter((r) => r.status === 'unmatched').length}</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tranzaksiya ID</TableHead>
            <TableHead>Talaba</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each records as record}
            <TableRow>
              <TableCell class="font-mono">{record.transactionId}</TableCell>
              <TableCell>
                {#if record.studentName}
                  {record.studentName}
                {:else}
                  <span class="text-muted-foreground italic">Biriktirilmagan</span>
                {/if}
              </TableCell>
              <TableCell>{formatCurrency(record.amount)}</TableCell>
              <TableCell>{formatDate(record.date)}</TableCell>
              <TableCell>
                {#if record.status === 'matched'}
                  <Badge variant="success">Biriktirilgan</Badge>
                {:else}
                  <Badge variant="warning">Kutilmoqda</Badge>
                {/if}
              </TableCell>
              <TableCell class="text-right">
                {#if record.status === 'unmatched'}
                  <Button variant="outline" size="sm">Biriktirish</Button>
                {:else}
                  <Button variant="ghost" size="sm">Ko'rish</Button>
                {/if}
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
