<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte'
  import { Eye, EyeOff, Lock, User } from 'lucide-svelte'
  import Card from '$lib/components/ui/card.svelte'
  import CardHeader from '$lib/components/ui/card-header.svelte'
  import CardTitle from '$lib/components/ui/card-title.svelte'
  import CardDescription from '$lib/components/ui/card-description.svelte'
  import CardContent from '$lib/components/ui/card-content.svelte'
  import Button from '$lib/components/ui/button.svelte'
  import Input from '$lib/components/ui/input.svelte'

  let username = $state('')
  let password = $state('')
  let showPassword = $state(false)
  let isLoading = $state(false)
  let error = $state('')

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    isLoading = true
    error = ''
    try {
      await auth.login(username, password)
    } catch (err) {
      error = auth.error || "Login xatosi. Qaytadan urinib ko'ring."
    } finally {
      isLoading = false
    }
  }
</script>

<svelte:head>
  <title>Kirish - EduStatus</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
  <Card class="w-full max-w-md">
    <CardHeader class="text-center">
      <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
        <span class="text-2xl font-bold text-white">E</span>
      </div>
      <CardTitle class="text-2xl">EduStatus</CardTitle>
      <CardDescription>Moliyaviy tizim - Buxgalteriya paneli</CardDescription>
    </CardHeader>
    <CardContent>
      <form onsubmit={handleSubmit} class="space-y-4">
        {#if error}
          <div class="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        {/if}

        <div class="space-y-2">
          <label class="text-sm font-medium" for="username">Foydalanuvchi nomi</label>
          <div class="relative">
            <User class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="username"
              type="text"
              placeholder="Email"
              class="pl-10"
              bind:value={username}
              required
            />
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium" for="password">Parol</label>
          <div class="relative">
            <Lock class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              class="pl-10 pr-10"
              bind:value={password}
              required
            />
            <button
              type="button"
              class="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              onclick={() => (showPassword = !showPassword)}
            >
              {#if showPassword}
                <EyeOff class="h-4 w-4" />
              {:else}
                <Eye class="h-4 w-4" />
              {/if}
            </button>
          </div>
        </div>

        <Button type="submit" class="w-full" disabled={isLoading}>
          {isLoading ? 'Kirish...' : 'Kirish'}
        </Button>
      </form>

      <div class="mt-4 text-center">
        <a href="/forgot-password" class="text-sm text-primary hover:underline">
          Parolni unutdingizmi?
        </a>
      </div>
    </CardContent>
  </Card>
</div>
