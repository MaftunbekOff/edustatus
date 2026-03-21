<script lang="ts">
  import { AlertTriangle, Search } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const debtors = [
    { id: '1', fullName: 'Valiyeva Dilnoza Karimovna', group: '102-B', phone: '+998902345678', debt: 500000, lastPayment: '2025-01-10', daysOverdue: 20 },
    { id: '2', fullName: 'Najimova Nigora Bahodirovna', group: '103-V', phone: '+998904567890', debt: 2500000, lastPayment: '2024-12-15', daysOverdue: 45 },
  ]

  let search = $state('')
  const filtered = $derived(debtors.filter((d) => d.fullName.toLowerCase().includes(search.toLowerCase())))
</script>

<svelte:head><title>Qarzdorlar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Qarzdorlar</h1>
    <p class="text-muted-foreground">To'lovni kechiktirgan talabalar ro'yxati</p>
  </div>

  <Card>
    <CardContent class="pt-6">
      <div class="flex gap-4 mb-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Qidirish..." bind:value={search} class="pl-10" />
        </div>
        <Button><AlertTriangle class="mr-2 h-4 w-4" />Eslatma yuborish</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.O.</TableHead>
            <TableHead>Guruh</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Qarzdorlik</TableHead>
            <TableHead>Oxirgi to'lov</TableHead>
            <TableHead>Kechikish (kun)</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each filtered as debtor}
            <TableRow>
              <TableCell class="font-medium">{debtor.fullName}</TableCell>
              <TableCell><Badge variant="secondary">{debtor.group}</Badge></TableCell>
              <TableCell>{debtor.phone}</TableCell>
              <TableCell class="text-red-600 font-semibold">{formatCurrency(debtor.debt)}</TableCell>
              <TableCell>{debtor.lastPayment}</TableCell>
              <TableCell>
                <Badge variant={debtor.daysOverdue > 30 ? 'error' : 'warning'}>{debtor.daysOverdue} kun</Badge>
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm">Eslatma</Button>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
