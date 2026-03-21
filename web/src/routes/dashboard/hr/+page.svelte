<script lang="ts">
  import { Users2, Plus } from 'lucide-svelte'
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

  const staff = [
    { id: '1', fullName: 'Toshmatov Sardor', position: "Direktor", department: "Rahbariyat", salary: 5000000, status: 'active' },
    { id: '2', fullName: "Xasanova Gulnora", position: 'Buxgalter', department: "Moliya", salary: 3500000, status: 'active' },
    { id: '3', fullName: "Nazarov Alisher", position: "O'qituvchi", department: "Ta'lim", salary: 2800000, status: 'active' },
  ]
</script>

<svelte:head><title>Kadrlar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Kadrlar Bo'limi</h1>
      <p class="text-muted-foreground">Xodimlar ro'yxati va HR boshqaruvi</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Xodim qo'shish</Button>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami xodimlar</CardTitle>
        <Users2 class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">{staff.length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Faol xodimlar</CardTitle>
        <Users2 class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">{staff.filter((s) => s.status === 'active').length}</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Bo'limlar</CardTitle>
        <Users2 class="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-blue-600">3</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.O.</TableHead>
            <TableHead>Lavozim</TableHead>
            <TableHead>Bo'lim</TableHead>
            <TableHead>Maosh</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each staff as employee}
            <TableRow>
              <TableCell class="font-medium">{employee.fullName}</TableCell>
              <TableCell>{employee.position}</TableCell>
              <TableCell><Badge variant="secondary">{employee.department}</Badge></TableCell>
              <TableCell>{employee.salary.toLocaleString()} so'm</TableCell>
              <TableCell><Badge variant="success">Faol</Badge></TableCell>
              <TableCell class="text-right">
                <a href="/dashboard/hr/{employee.id}">
                  <Button variant="ghost" size="sm">Ko'rish</Button>
                </a>
              </TableCell>
            </TableRow>
          {/each}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
</div>
