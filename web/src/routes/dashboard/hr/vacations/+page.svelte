<script lang="ts">
  import { Calendar, Plus } from 'lucide-svelte'
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

  const vacations = [
    { id: '1', employee: "Xasanova Gulnora", startDate: '2025-02-10', endDate: '2025-02-21', days: 12, type: "Yillik ta'til", status: 'approved' },
    { id: '2', employee: 'Toshmatov Sardor', startDate: '2025-03-01', endDate: '2025-03-14', days: 14, type: "Yillik ta'til", status: 'pending' },
  ]
</script>

<svelte:head><title>Ta'tillar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Ta'tillar</h1>
      <p class="text-muted-foreground">Xodimlar ta'til so'rovlari</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Ta'til so'rash</Button>
  </div>
  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Xodim</TableHead>
            <TableHead>Boshlanish</TableHead>
            <TableHead>Tugash</TableHead>
            <TableHead>Kunlar</TableHead>
            <TableHead>Tur</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each vacations as vac}
            <TableRow>
              <TableCell class="font-medium">{vac.employee}</TableCell>
              <TableCell>{vac.startDate}</TableCell>
              <TableCell>{vac.endDate}</TableCell>
              <TableCell>{vac.days} kun</TableCell>
              <TableCell><Badge variant="secondary">{vac.type}</Badge></TableCell>
              <TableCell>
                {#if vac.status === 'approved'}
                  <Badge variant="success">Tasdiqlandi</Badge>
                {:else}
                  <Badge variant="warning">Kutilmoqda</Badge>
                {/if}
              </TableCell>
              <TableCell class="text-right">
                {#if vac.status === 'pending'}
                  <Button variant="outline" size="sm">Tasdiqlash</Button>
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
