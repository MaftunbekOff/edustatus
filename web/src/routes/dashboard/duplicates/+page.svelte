<script lang="ts">
  import { Shield, AlertTriangle } from 'lucide-svelte'
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

  const duplicates = [
    { id: '1', pinfl: '12345678901234', entries: [
      { fullName: 'Aliyev Anvar', institution: 'Tibbiyot texnikumi', group: '101-A' },
      { fullName: 'Aliev Anvar', institution: 'Sog\'liqni saqlash kolleji', group: '202-B' },
    ]},
  ]
</script>

<svelte:head><title>Dublikatlar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div>
    <h1 class="text-2xl font-bold tracking-tight">PINFL Dublikatlar</h1>
    <p class="text-muted-foreground">Bir xil PINFL bilan ro'yxatdan o'tgan talabalar</p>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami dublikatlar</CardTitle>
        <Shield class="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-red-600">{duplicates.length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Ko'rib chiqilgan</CardTitle>
        <Shield class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">0</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Kutilayotgan</CardTitle>
        <AlertTriangle class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-yellow-600">{duplicates.length}</div></CardContent>
    </Card>
  </div>

  {#each duplicates as dup}
    <Card>
      <CardHeader>
        <CardTitle class="text-base">PINFL: {dup.pinfl}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>F.I.O.</TableHead>
              <TableHead>Muassasa</TableHead>
              <TableHead>Guruh</TableHead>
              <TableHead>Amallar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each dup.entries as entry}
              <TableRow>
                <TableCell class="font-medium">{entry.fullName}</TableCell>
                <TableCell>{entry.institution}</TableCell>
                <TableCell><Badge variant="secondary">{entry.group}</Badge></TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">Tasdiqlash</Button>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  {/each}
</div>
