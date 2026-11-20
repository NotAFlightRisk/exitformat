<script lang="ts">
  import Caveats from '#lib/components/Caveats.svelte';
  import Sources from '#lib/components/Sources.svelte';
  import type { PathView, ServiceLink } from '#lib/data/types.ts';

  let {
    path,
    source,
    destination,
    caveats = true,
    sources = true,
    headings = true
  }: {
    path: PathView;
    source: ServiceLink;
    destination: ServiceLink;
    caveats?: boolean;
    sources?: boolean;
    headings?: boolean;
  } = $props();

  type Side = { id: string; name: string; limitations: string[]; docs?: string; sources: string[] };

  const title = $derived(headings ? 'h3' : 'p');
  const sides: Side[] = $derived([
    ...(path.export
      ? [{ ...path.export, id: 'export', name: `Exporting from ${source.name}` }]
      : []),
    ...(path.conversion
      ? [
          {
            id: 'convert',
            name: `Converting with ${path.conversion.tool}`,
            limitations: path.conversion.limitations,
            docs: path.conversion.url,
            sources: []
          }
        ]
      : []),
    { ...path.import, id: 'import', name: `Importing into ${destination.name}` }
  ]);
</script>

<div class="sides">
  {#each sides as side (side.id)}
    <div class="side">
      <svelte:element this={title} class="name">{side.name}</svelte:element>
      {#if caveats}<Caveats items={side.limitations} />{/if}
      {#if sources}<Sources docs={side.docs} sources={side.sources} />{/if}
    </div>
  {/each}
</div>

<style>
  .sides {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    border: var(--hairline) solid var(--rule);
    background: var(--rule);
  }

  .side {
    display: grid;
    flex: 1 1 18rem;
    align-content: start;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-5);
    background: var(--surface-raised);
  }

  .name {
    font-size: var(--size-sm);
    font-weight: 750;
  }
</style>
