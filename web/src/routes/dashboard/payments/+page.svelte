<script lang="ts">
  import { Search, Plus, Download, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-svelte'
  import { formatCurrency, formatDate, getStatusText } from '$lib/utils'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
  import Select from '$lib/components/ui/select.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const payments = [
    { id: '1', studentName: 'Aliyev Anvar Abdullaevich', amount: 1500000, date: '2025-01-15', method: 'Bank', status: 'confirmed', receiptNo: 'RCP-001' },
    { id: '2', studentName: 'Valiyeva Dilnoza Karimovna', amount: 2000000, date: '2025-01-15', method: 'Click', status: 'pending', receiptNo: 'RCP-002' },
    { id: '3', studentName: 'Karimov Bobur Rahimovich', amount: 1000000, date: '2025-01-14', method: 'Naqd', status: 'confirmed', receiptNo: 'RCP-003' },
    { id: '4', studentName: 'Najimova Nigora Bahodirovna', amount: 2500000, date: '2025-01-14', method: 'Bank', status: 'confirmed', receiptNo: 'RCP-004' },
    { id: '5', studentName: 'Rahimov Jahongir Toshmatovich', amount: 500000, date: '2025-01-13', method: 'Payme', status: 'rejected', receiptNo: 'RCP-005' },
  ]

  let search = $state('')
  let statusFilter = $state('all')
  let methodFilter = $state('all')

  const filtered = $derived(
    payments.filter((p) => {
      const matchSearch = p.studentName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchMethod = methodFilter === 'all' || p.method === methodFilter
      return matchSearch && matchStatus && matchMethod
    }),
  )

  const totalAmount = $derived(filtered.reduce((sum, p) => sum + p.amount, 0))
  const confirmedAmount = $derived(filtered.filter((p) => p.status === 'confirmed').reduce((sum, p) => sum + p.amount, 0))
</script>

<svelte:head><title>To'lovlar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">To'lovlar</h1>
      <p class="text-muted-foreground">Barcha to'lovlar ro'yxati</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />To'lov qo'shish</Button>
  </div>

  <div class="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami to'lovlar</CardTitle>
        <CreditCard class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{formatCurrency(totalAmount)}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Tasdiqlangan</CardTitle>
        <CheckCircle class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{formatCurrency(confirmedAmount)}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kutilayotgan</CardTitle>
        <Clock class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-yellow-600">{payments.filter((p) => p.status === 'pending').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Rad etilgan</CardTitle>
        <XCircle class="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-red-600">{payments.filter((p) => p.status === 'rejected').length}</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Talaba ismi bo'yicha qidirish..." bind:value={search} class="pl-10" />
        </div>
        <Select bind:value={statusFilter} options={[
          { value: 'all', label: 'Barcha statuslar' },
          { value: 'confirmed', label: 'Tasdiqlangan' },
          { value: 'pending', label: 'Kutilmoqda' },
          { value: 'rejected', label: 'Rad etilgan' },
        ]} class="w-[160px]" />
        <Select bind:value={methodFilter} options={[
          { value: 'all', label: 'Barcha usullar' },
          { value: 'Bank', label: 'Bank' },
          { value: 'Click', label: 'Click' },
          { value: 'Payme', label: 'Payme' },
          { value: 'Naqd', label: 'Naqd' },
        ]} class="w-[160px]" />
        <Button variant="outline"><Download class="mr-2 h-4 w-4" />Export</Button>
      </div>
    </CardContent>
  </Card>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kvitansiya</TableHead>
            <TableHead>Talaba</TableHead>
            <TableHead>Summa</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Usul</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each filtered as payment}
            <TableRow>
              <TableCell class="font-mono">{payment.receiptNo}</TableCell>
              <TableCell class="font-medium">{payment.studentName}</TableCell>
              <TableCell>{formatCurrency(payment.amount)}</TableCell>
              <TableCell>{formatDate(payment.date)}</TableCell>
              <TableCell><Badge variant="secondary">{payment.method}</Badge></TableCell>
              <TableCell>
                {#if payment.status === 'confirmed'}
                  <Badge variant="success">Tasdiqlangan</Badge>
                {:else if payment.status === 'pending'}
                  <Badge variant="warning">Kutilmoqda</Badge>
                {:else}
                  <Badge variant="error">Rad etilgan</Badge>
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
