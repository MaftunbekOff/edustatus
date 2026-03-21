<script lang="ts">
  import { Search, Plus, Download, Users, GraduationCap } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
  import Select from '$lib/components/ui/select.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const students = [
    { id: '1', fullName: 'Aliyev Anvar Abdullaevich', pinfl: '12345678901234', group: '101-A', phone: '+998901234567', balance: 1500000, status: 'active', contractAmount: 12000000 },
    { id: '2', fullName: 'Valiyeva Dilnoza Karimovna', pinfl: '23456789012345', group: '102-B', phone: '+998902345678', balance: -500000, status: 'debt', contractAmount: 12000000 },
    { id: '3', fullName: 'Karimov Bobur Rahimovich', pinfl: '34567890123456', group: '101-A', phone: '+998903456789', balance: 0, status: 'active', contractAmount: 12000000 },
    { id: '4', fullName: 'Najimova Nigora Bahodirovna', pinfl: '45678901234567', group: '103-V', phone: '+998904567890', balance: -2500000, status: 'debt', contractAmount: 15000000 },
    { id: '5', fullName: 'Rahimov Jahongir Toshmatovich', pinfl: '56789012345678', group: '102-B', phone: '+998905678901', balance: 2000000, status: 'active', contractAmount: 12000000 },
  ]

  const groups = ['101-A', '102-B', '103-V', '104-G', '105-D']

  let search = $state('')
  let groupFilter = $state('all')
  let statusFilter = $state('all')

  const filtered = $derived(
    students.filter((s) => {
      const matchSearch = s.fullName.toLowerCase().includes(search.toLowerCase()) || s.pinfl.includes(search)
      const matchGroup = groupFilter === 'all' || s.group === groupFilter
      const matchStatus = statusFilter === 'all' || s.status === statusFilter
      return matchSearch && matchGroup && matchStatus
    }),
  )
</script>

<svelte:head><title>Talabalar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Talabalar</h1>
      <p class="text-muted-foreground">Barcha talabalar ro'yxati va ularning to'lov holati</p>
    </div>
    <Button>
      <Plus class="mr-2 h-4 w-4" />
      Talaba qo'shish
    </Button>
  </div>

  <!-- Stats -->
  <div class="grid gap-4 md:grid-cols-4">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami talabalar</CardTitle>
        <Users class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">320</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Faol talabalar</CardTitle>
        <GraduationCap class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">298</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Qarzdorlar</CardTitle>
        <Users class="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-red-600">22</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami qarzdorlik</CardTitle>
        <Users class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-yellow-600">{formatCurrency(125000000)}</div>
      </CardContent>
    </Card>
  </div>

  <!-- Filters -->
  <Card>
    <CardContent class="pt-6">
      <div class="flex flex-col gap-4 md:flex-row md:items-center">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Ism yoki PINFL bo'yicha qidirish..." bind:value={search} class="pl-10" />
        </div>
        <Select
          bind:value={groupFilter}
          options={[{ value: 'all', label: 'Barcha guruhlar' }, ...groups.map((g) => ({ value: g, label: g }))]}
          class="w-[160px]"
        />
        <Select
          bind:value={statusFilter}
          options={[
            { value: 'all', label: 'Barcha statuslar' },
            { value: 'active', label: 'Faol' },
            { value: 'debt', label: 'Qarzdor' },
          ]}
          class="w-[160px]"
        />
        <Button variant="outline">
          <Download class="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </CardContent>
  </Card>

  <!-- Table -->
  <Card>
    <CardContent class="pt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.O.</TableHead>
            <TableHead>PINFL</TableHead>
            <TableHead>Guruh</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Shartnoma</TableHead>
            <TableHead>Balans</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each filtered as student}
            <TableRow>
              <TableCell class="font-medium">{student.fullName}</TableCell>
              <TableCell class="font-mono text-sm">{student.pinfl}</TableCell>
              <TableCell><Badge variant="secondary">{student.group}</Badge></TableCell>
              <TableCell>{student.phone}</TableCell>
              <TableCell>{formatCurrency(student.contractAmount)}</TableCell>
              <TableCell class={student.balance < 0 ? 'text-red-600 font-semibold' : ''}>
                {formatCurrency(student.balance)}
              </TableCell>
              <TableCell>
                {#if student.balance < 0}
                  <Badge variant="error">Qarzdor</Badge>
                {:else}
                  <Badge variant="success">Faol</Badge>
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
