<script lang="ts">
  import { CreditCard } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
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

  const subscriptions = [
    { id: '1', orgName: 'Tibbiyot Texnikumi', plan: 'pro', amount: 1000000, startDate: '2024-09-01', endDate: '2025-09-01', status: 'active' },
    { id: '2', orgName: 'IT Academy', plan: 'basic', amount: 500000, startDate: '2024-11-15', endDate: '2025-11-15', status: 'trial' },
  ]
</script>

<svelte:head><title>Obunalar - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Obunalar</h1>
    <p class="text-muted-foreground">Tashkilotlar obuna holati</p>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tashkilot</TableHead>
            <TableHead>Tarif</TableHead>
            <TableHead>Narxi</TableHead>
            <TableHead>Boshlanish</TableHead>
            <TableHead>Tugash</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each subscriptions as sub}
            <TableRow>
              <TableCell class="font-medium">{sub.orgName}</TableCell>
              <TableCell class="capitalize">{sub.plan}</TableCell>
              <TableCell>{formatCurrency(sub.amount)}/oy</TableCell>
              <TableCell>{sub.startDate}</TableCell>
              <TableCell>{sub.endDate}</TableCell>
              <TableCell>
                {#if sub.status === 'active'}
                  <Badge variant="success">Faol</Badge>
                {:else}
                  <Badge variant="warning">Sinov</Badge>
                {/if}
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm">Tahrirlash</Button>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
