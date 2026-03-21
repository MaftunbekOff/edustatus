<script lang="ts">
  import { Clock } from 'lucide-svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const attendance = [
    { name: 'Toshmatov Sardor', date: '2025-01-20', checkIn: '08:55', checkOut: '18:00', status: 'present' },
    { name: "Xasanova Gulnora", date: '2025-01-20', checkIn: '09:15', checkOut: '18:30', status: 'late' },
    { name: "Nazarov Alisher", date: '2025-01-20', checkIn: null, checkOut: null, status: 'absent' },
  ]
</script>

<svelte:head><title>Xodimlar davomati - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">Xodimlar Davomati</h1>
    <p class="text-muted-foreground">Xodimlar davomat hisobi</p>
  </div>
  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Xodim</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Keldi</TableHead>
            <TableHead>Ketdi</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each attendance as a}
            <TableRow>
              <TableCell class="font-medium">{a.name}</TableCell>
              <TableCell>{a.date}</TableCell>
              <TableCell>{a.checkIn || '-'}</TableCell>
              <TableCell>{a.checkOut || '-'}</TableCell>
              <TableCell>
                {#if a.status === 'present'}
                  <Badge variant="success">Keldi</Badge>
                {:else if a.status === 'late'}
                  <Badge variant="warning">Kechikdi</Badge>
                {:else}
                  <Badge variant="error">Kelmadi</Badge>
                {/if}
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
