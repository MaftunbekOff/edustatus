<script lang="ts">
  import { Bell, ArrowLeft } from 'lucide-svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Badge from '$lib/components/ui/badge.svelte'

  const notifications = [
    { id: '1', message: "2025-02-01 gacha to'lov muddati", type: 'payment', date: '2025-01-25', isRead: false },
    { id: '2', message: "Yanvar oyida 92% davomat", type: 'attendance', date: '2025-01-20', isRead: true },
    { id: '3', message: "Yangi shartnoma imzolandi", type: 'contract', date: '2025-01-05', isRead: true },
  ]
</script>

<svelte:head><title>Bildirishnomalar - Talaba Portali</title></svelte:head>

<div class="min-h-screen bg-gray-50 p-4">
  <div class="max-w-2xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <a href="/student">
        <Button variant="ghost" size="icon"><ArrowLeft class="h-4 w-4" /></Button>
      </a>
      <h1 class="text-2xl font-bold">Bildirishnomalar</h1>
    </div>

    <div class="space-y-3">
      {#each notifications as notif}
        <Card class={notif.isRead ? '' : 'border-blue-200 bg-blue-50'}>
          <CardContent class="pt-4 pb-4">
            <div class="flex items-start gap-3">
              <Bell class="h-5 w-5 mt-0.5 {notif.isRead ? 'text-muted-foreground' : 'text-blue-500'}" />
              <div class="flex-1">
                <p class="text-sm">{notif.message}</p>
                <p class="text-xs text-muted-foreground mt-1">{notif.date}</p>
              </div>
              {#if !notif.isRead}
                <Badge variant="secondary">Yangi</Badge>
              {/if}
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  </div>
</div>
