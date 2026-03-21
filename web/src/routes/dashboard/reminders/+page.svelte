<script lang="ts">
  import { Bell, Plus, Send } from 'lucide-svelte'
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

  const reminders = [
    { id: '1', title: "To'lov eslatmasi", recipients: 22, channel: 'SMS', scheduledAt: '2025-01-20 09:00', status: 'scheduled' },
    { id: '2', title: "Qarzdorlik xabari", recipients: 10, channel: 'Telegram', scheduledAt: '2025-01-18 10:00', status: 'sent' },
    { id: '3', title: "Shartnoma muddati", recipients: 5, channel: 'SMS', scheduledAt: '2025-01-15 08:00', status: 'sent' },
  ]
</script>

<svelte:head><title>Eslatmalar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Eslatmalar</h1>
      <p class="text-muted-foreground">SMS va Telegram orqali bildirishnomalar</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Eslatma yaratish</Button>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami eslatmalar</CardTitle>
        <Bell class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{reminders.length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Yuborilgan</CardTitle>
        <Send class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{reminders.filter((r) => r.status === 'sent').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Rejalashtirilgan</CardTitle>
        <Bell class="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-blue-600">{reminders.filter((r) => r.status === 'scheduled').length}</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sarlavha</TableHead>
            <TableHead>Qabul qiluvchilar</TableHead>
            <TableHead>Kanal</TableHead>
            <TableHead>Vaqt</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each reminders as reminder}
            <TableRow>
              <TableCell class="font-medium">{reminder.title}</TableCell>
              <TableCell>{reminder.recipients} kishi</TableCell>
              <TableCell><Badge variant="secondary">{reminder.channel}</Badge></TableCell>
              <TableCell class="text-sm">{reminder.scheduledAt}</TableCell>
              <TableCell>
                {#if reminder.status === 'sent'}
                  <Badge variant="success">Yuborildi</Badge>
                {:else}
                  <Badge variant="secondary">Rejalashtirilgan</Badge>
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
