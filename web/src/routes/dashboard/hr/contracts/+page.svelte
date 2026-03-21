<script lang="ts">
  import { FileSignature, Plus } from 'lucide-svelte'
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
    { id: '1', employee: 'Toshmatov Sardor', contractNo: 'IK-2024-001', startDate: '2024-09-01', endDate: '2025-08-31', salary: 5000000, status: 'active' },
    { id: '2', employee: "Xasanova Gulnora", contractNo: 'IK-2024-002', startDate: '2024-09-01', endDate: '2025-08-31', salary: 3500000, status: 'active' },
  ]
</script>

<svelte:head><title>Mehnat shartnomalari - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Mehnat Shartnomalari</h1>
      <p class="text-muted-foreground">Xodimlar mehnat shartnomalari</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Shartnoma qo'shish</Button>
  </div>
  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Xodim</TableHead>
            <TableHead>Shartnoma №</TableHead>
            <TableHead>Boshlanish</TableHead>
            <TableHead>Tugash</TableHead>
            <TableHead>Maosh</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each contracts as contract}
            <TableRow>
              <TableCell class="font-medium">{contract.employee}</TableCell>
              <TableCell class="font-mono text-sm">{contract.contractNo}</TableCell>
              <TableCell>{contract.startDate}</TableCell>
              <TableCell>{contract.endDate}</TableCell>
              <TableCell>{contract.salary.toLocaleString()} so'm</TableCell>
              <TableCell><Badge variant="success">Faol</Badge></TableCell>
              <TableCell class="text-right"><Button variant="ghost" size="sm">Ko'rish</Button></TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
