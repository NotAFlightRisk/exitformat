<script lang="ts">
  import CategorySymbol from '#lib/components/CategorySymbol.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import PathBadge from '#lib/components/PathBadge.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import type { SearchResult } from '#lib/search.ts';
  import { symbol } from '#lib/text.ts';

  let { result, tag = false }: { result: SearchResult; tag?: boolean } = $props();

  const kinds = { migration: 'Move', service: 'Service', category: 'Category', format: 'Format' };
  // a format wears its extension when it's short enough to fit the tile
  const extension = $derived(result.detail.split(', ')[0].slice(1));
  const short = $derived(result.kind === 'format' && extension.length > 0 && extension.length < 5);
  const plate = $derived(short ? extension : symbol(result.name));
</script>

{#if result.route}
  {@const { source, destination, kind, carried, lost, unknown } = result.route}
  <span class="ends">
    <Tile name={source.name} icon={source.icon} size="sm" />
    <Icon name="arrow" />
    <Tile name={destination.name} icon={destination.icon} size="sm" />
  </span>
  <span class="text">
    <span class="name">Move from {result.name}</span>
    <span class="carry">
      <PathBadge {kind} />
      <span><StateMark state="included" /> {carried} carry over</span>
      <span><StateMark state="excluded" /> {lost} lost</span>
      <span><StateMark state="unknown" /> {unknown} not sure</span>
    </span>
  </span>
{:else}
  {#if result.kind === 'service'}
    <Tile name={result.name} icon={result.icon} size="sm" />
  {:else}
    <span class="mark" class:extension={short} style:--length={plate.length} aria-hidden="true">
      {#if result.category}
        <CategorySymbol id={result.category} name={result.name} />
      {:else}
        {plate}
      {/if}
    </span>
  {/if}
  <span class="text">
    <span class="name">{result.name}</span>
    {#if result.detail}
      <span class="detail {result.kind}">{result.detail}</span>
    {/if}
  </span>
{/if}
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

    &.extension {
      font-family: var(--font-data);
      font-size: min(0.75rem, calc(2.6rem / var(--length)));
      font-weight: 400;
      letter-spacing: -0.04em;
    }
  }

  .ends {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: var(--space-1);
    color: var(--text-muted);
  }

  .text {
    display: grid;
    gap: var(--space-1);
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

  .carry {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-3);
    font-size: var(--size-sm);

    > span {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      white-space: nowrap;
    }
  }

  .tag {
    margin-inline-start: auto;
    color: var(--text-muted);
    font-size: var(--size-xs);
  }
</style>
