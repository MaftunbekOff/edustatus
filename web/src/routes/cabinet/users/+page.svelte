<script lang="ts">
  import { Users, Plus } from 'lucide-svelte'
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

  const users = [
    { id: '1', fullName: 'Super Admin', email: 'admin@platform.uz', role: 'creator', status: 'active', lastLogin: '2025-01-20' },
    { id: '2', fullName: 'Kamoliddin Toshev', email: 'admin@texnikum.uz', role: 'admin', status: 'active', lastLogin: '2025-01-19' },
    { id: '3', fullName: "Gulnora Xasanova", email: 'accountant@academy.uz', role: 'accountant', status: 'active', lastLogin: '2025-01-18' },
  ]
</script>

<svelte:head><title>Foydalanuvchilar - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Foydalanuvchilar</h1>
      <p class="text-muted-foreground">Platforma foydalanuvchilari boshqaruvi</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Foydalanuvchi qo'shish</Button>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.O.</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Oxirgi kirish</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each users as user}
            <TableRow>
              <TableCell class="font-medium">{user.fullName}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
              <TableCell><Badge variant="success">Faol</Badge></TableCell>
              <TableCell>{user.lastLogin}</TableCell>
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
