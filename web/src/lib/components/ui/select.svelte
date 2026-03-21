<script lang="ts">
  import { cn } from '$lib/utils'

  interface Option {
    value: string
    label: string
  }

  interface Props {
    value?: string
    options: Option[]
    class?: string
    disabled?: boolean
    placeholder?: string
    onchange?: (e: Event) => void
    [key: string]: unknown
  }

  let {
    value = $bindable(''),
    options,
    class: className = '',
    disabled = false,
    placeholder,
    onchange,
    ...rest
  }: Props = $props()
</script>

<select
  bind:value
  {disabled}
  {onchange}
  class={cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )}
  {...rest}
>
  {#if placeholder}
    <option value="" disabled>{placeholder}</option>
  {/if}
  {#each options as option}
    <option value={option.value}>{option.label}</option>
  {/each}
</select>
