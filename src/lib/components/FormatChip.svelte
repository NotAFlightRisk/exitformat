<script lang="ts">
  import FormatMark from '#lib/components/FormatMark.svelte';
  import type { FormatLink } from '#lib/data/types.ts';

  let { format }: { format: FormatLink } = $props();
</script>

<a class="format" href={format.href}>
  <FormatMark {format} />
  {format.name}{#if format.standard}<span class="visually-hidden">, an open format</span>{/if}
</a>

<style>
  .format {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: 0.1875rem var(--space-2);
    border: var(--hairline) solid var(--rule-strong);
    background: var(--surface-raised);
    font-family: var(--font-data);
    font-size: 0.8125rem;
    line-height: 1.3;
    letter-spacing: -0.04em;
    overflow-wrap: anywhere;
    text-decoration: none;
    transition:
      background-color var(--quick) var(--ease),
      border-color var(--quick) var(--ease);

    &:hover {
      border-color: var(--accent);
      background: var(--surface-hover);
    }
  }
</style>
