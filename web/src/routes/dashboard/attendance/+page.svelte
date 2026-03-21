<script lang="ts">
  import { QrCode, CheckCircle, XCircle, Clock } from 'lucide-svelte'
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

  const attendance = [
    { id: '1', fullName: 'Aliyev Anvar', group: '101-A', date: '2025-01-20', time: '08:45', status: 'present' },
    { id: '2', fullName: 'Valiyeva Dilnoza', group: '102-B', date: '2025-01-20', time: null, status: 'absent' },
    { id: '3', fullName: 'Karimov Bobur', group: '101-A', date: '2025-01-20', time: '09:10', status: 'late' },
  ]
</script>

<svelte:head><title>Davomat - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Davomat</h1>
      <p class="text-muted-foreground">QR-kod orqali davomat nazorati</p>
    </div>
    <Button>
      <QrCode class="mr-2 h-4 w-4" />
      QR yaratish
    </Button>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kelgan</CardTitle>
        <CheckCircle class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{attendance.filter((a) => a.status === 'present').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kechikkan</CardTitle>
        <Clock class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-yellow-600">{attendance.filter((a) => a.status === 'late').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kelmagan</CardTitle>
        <XCircle class="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-red-600">{attendance.filter((a) => a.status === 'absent').length}</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.O.</TableHead>
            <TableHead>Guruh</TableHead>
            <TableHead>Sana</TableHead>
            <TableHead>Vaqt</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each attendance as a}
            <TableRow>
              <TableCell class="font-medium">{a.fullName}</TableCell>
              <TableCell><Badge variant="secondary">{a.group}</Badge></TableCell>
              <TableCell>{a.date}</TableCell>
              <TableCell>{a.time || '-'}</TableCell>
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
