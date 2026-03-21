<script lang="ts">
  import { Search, Plus, Download, Users, GraduationCap } from 'lucide-svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Table from '$lib/components/ui/table.svelte'
  import TableHeader from '$lib/components/ui/table-header.svelte'
  import TableBody from '$lib/components/ui/table-body.svelte'
  import TableRow from '$lib/components/ui/table-row.svelte'
  import TableHead from '$lib/components/ui/table-head.svelte'
  import TableCell from '$lib/components/ui/table-cell.svelte'

  const teachers = [
    { id: '1', fullName: "Xasanov Akbar Mirzayevich", subject: "Matematika", phone: '+998901111111', groups: 3, status: 'active' },
    { id: '2', fullName: "Toshmatova Gulnora Yusupovna", subject: 'Biologiya', phone: '+998902222222', groups: 2, status: 'active' },
    { id: '3', fullName: "Nazarov Sherzod Baxtiyorovich", subject: 'Kimyo', phone: '+998903333333', groups: 4, status: 'active' },
  ]

  let search = $state('')
  const filtered = $derived(teachers.filter((t) => t.fullName.toLowerCase().includes(search.toLowerCase())))
</script>

<svelte:head><title>O'qituvchilar - EduStatus</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">O'qituvchilar</h1>
      <p class="text-muted-foreground">O'qituvchilar ro'yxati va ularning ma'lumotlari</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />O'qituvchi qo'shish</Button>
  </div>

  <div class="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Jami o'qituvchilar</CardTitle>
        <GraduationCap class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold">45</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Faol</CardTitle>
        <Users class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-green-600">42</div></CardContent>
    </Card>
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Ta'tilda</CardTitle>
        <Users class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent><div class="text-2xl font-bold text-yellow-600">3</div></CardContent>
    </Card>
  </div>

  <Card>
    <CardContent class="pt-6">
      <div class="flex gap-4 mb-4">
        <div class="relative flex-1">
          <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Ism bo'yicha qidirish..." bind:value={search} class="pl-10" />
        </div>
        <Button variant="outline"><Download class="mr-2 h-4 w-4" />Export</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>F.I.O.</TableHead>
            <TableHead>Fan</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Guruhlar soni</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Amallar</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {#each filtered as teacher}
            <TableRow>
              <TableCell class="font-medium">{teacher.fullName}</TableCell>
              <TableCell>{teacher.subject}</TableCell>
              <TableCell>{teacher.phone}</TableCell>
              <TableCell>{teacher.groups} ta guruh</TableCell>
              <TableCell><Badge variant="success">Faol</Badge></TableCell>
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
