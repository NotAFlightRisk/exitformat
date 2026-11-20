<script lang="ts">
  import Tile from '#lib/components/Tile.svelte';
  import type { SearchResult } from '#lib/search.ts';
  import { initials, symbol } from '#lib/text.ts';

  let { result, tag = false }: { result: SearchResult; tag?: boolean } = $props();

  const kinds = { migration: 'Move', service: 'Service', category: 'Category', format: 'Format' };
  // a format wears its extension when it's short enough to fit the tile
  const extension = $derived(result.detail.split(', ')[0].slice(1));
  const short = $derived(result.kind === 'format' && extension.length > 0 && extension.length < 5);
  const plate = $derived(
    result.kind === 'category' ? initials(result.name) : short ? extension : symbol(result.name)
  );
</script>

{#if result.kind === 'service' || result.kind === 'migration'}
  <Tile name={result.name} icon={result.icon} size="sm" />
{:else}
  <span class="mark" class:extension={short} style:--length={plate.length} aria-hidden="true">
    {plate}
  </span>
{/if}
<span class="text">
  <span class="name">{result.kind === 'migration' ? `Move from ${result.name}` : result.name}</span>
  {#if result.detail}
    <span class="detail {result.kind}">{result.detail}</span>
  {/if}
</span>
{#if tag}<span class="tag">{kinds[result.kind]}</span>{/if}

<style>
  .mark {
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: 1.75rem;
    block-size: 1.75rem;
    border: var(--hairline) solid var(--rule-strong);
    background: var(--surface-raised);
    font-size: 0.75rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
    transition: border-color var(--quick) var(--ease);

    &.extension {
      font-family: var(--font-data);
      font-size: min(0.75rem, calc(2.6rem / var(--length)));
      font-weight: 400;
      letter-spacing: -0.04em;
    }
  }

  .text {
    display: grid;
    min-inline-size: 0;
  }

  .name {
    font-weight: 650;
  }

  .detail {
    color: var(--text-muted);
    font-size: var(--size-sm);

    &.format {
      font-family: var(--font-data);
      letter-spacing: -0.04em;
    }
  }

  .tag {
    margin-inline-start: auto;
    color: var(--text-muted);
    font-size: var(--size-xs);
  }
</style>
