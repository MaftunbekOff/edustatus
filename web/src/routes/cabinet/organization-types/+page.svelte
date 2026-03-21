<script lang="ts">
  import { Globe, Plus } from 'lucide-svelte'
  import { organizationTypes, organizationCategories } from '$lib/constants/organization'
  import Badge from '$lib/components/ui/badge.svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import Button from '$lib/components/ui/button.svelte'
</script>

<svelte:head><title>Tashkilot turlari - Cabinet</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-2xl font-bold tracking-tight">Tashkilot turlari</h1>
      <p class="text-muted-foreground">Tizimda mavjud tashkilot turlari</p>
    </div>
    <Button><Plus class="mr-2 h-4 w-4" />Tur qo'shish</Button>
  </div>

  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    {#each organizationCategories as category}
      <Card>
        <CardHeader>
          <CardTitle class="text-base flex items-center gap-2">
            <Globe class="h-4 w-4" />
            {category.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            {#each organizationTypes.filter((t) => t.category === category.value) as type}
              <Badge variant="secondary">{type.label}</Badge>
            {/each}
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>
</div>
