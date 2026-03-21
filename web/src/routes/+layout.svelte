<script lang="ts">
  import '../app.css'
  import ToastContainer from '$lib/components/ui/toast-container.svelte'
  import { auth } from '$lib/stores/auth.svelte'
  import { onMount } from 'svelte'
  import type { Snippet } from 'svelte'

  interface Props { children: Snippet }
  let { children }: Props = $props()

  onMount(() => {
    auth.init()
  })
</script>

<svelte:head>
  <title>EduStatus - Moliyaviy Monitoring Tizimi</title>
  <meta name="description" content="O'zbekistondagi ta'lim muassasalari uchun moliyaviy monitoring tizimi" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
</svelte:head>

{@render children()}
<ToastContainer />
