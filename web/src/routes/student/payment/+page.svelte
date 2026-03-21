<script lang="ts">
  import { CreditCard, ArrowLeft } from 'lucide-svelte'
  import { formatCurrency } from '$lib/utils'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'
  import Select from '$lib/components/ui/select.svelte'

  let amount = $state(0)
  let method = $state('click')
</script>

<svelte:head><title>To'lov - Talaba Portali</title></svelte:head>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
  <Card class="w-full max-w-md">
    <CardHeader>
      <div class="flex items-center gap-3">
        <a href="/student">
          <Button variant="ghost" size="icon"><ArrowLeft class="h-4 w-4" /></Button>
        </a>
        <div>
          <CardTitle>To'lov qilish</CardTitle>
          <p class="text-sm text-muted-foreground">Qarz: {formatCurrency(5000000)}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="space-y-2">
        <label class="text-sm font-medium" for="pay-amount">Summa (so'm)</label>
        <Input id="pay-amount" type="number" bind:value={amount} placeholder="0" />
      </div>
      <div class="space-y-2">
        <label class="text-sm font-medium" for="pay-method">To'lov usuli</label>
        <Select id="pay-method" bind:value={method} options={[
          { value: 'click', label: 'Click' },
          { value: 'payme', label: 'Payme' },
          { value: 'bank', label: 'Bank o\'tkazmasi' },
        ]} />
      </div>
      <Button class="w-full">
        <CreditCard class="mr-2 h-4 w-4" />
        To'lash
      </Button>
    </CardContent>
  </Card>
</div>
