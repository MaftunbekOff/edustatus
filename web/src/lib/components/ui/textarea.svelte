<script lang="ts">
  import { cn } from '$lib/utils'

  interface Props {
    value?: string
    placeholder?: string
    class?: string
    disabled?: boolean
    required?: boolean
    rows?: number
    id?: string
    name?: string
    oninput?: (e: Event) => void
    onchange?: (e: Event) => void
    [key: string]: unknown
  }

  let {
    value = $bindable(''),
    placeholder,
    class: className = '',
    disabled = false,
    required = false,
    rows = 3,
    id,
    name,
    oninput,
    onchange,
    ...rest
  }: Props = $props()
</script>

<textarea
  bind:value
  {placeholder}
  {disabled}
  {required}
  {rows}
  {id}
  {name}
  {oninput}
  {onchange}
  class={cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )}
  {...rest}
></textarea>
