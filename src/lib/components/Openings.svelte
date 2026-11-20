<script lang="ts">
  import FormatChip from '#lib/components/FormatChip.svelte';
  import PathBadge from '#lib/components/PathBadge.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import type { OpeningView } from '#lib/data/types.ts';

  let { openings, side }: { openings: OpeningView[]; side: 'out' | 'in' } = $props();

  // the format page lists the rest, under whichever side the apps are on
  const rest = $derived(side === 'out' ? 'importers' : 'exporters');
</script>

<ul class="openings">
  {#each openings as opening (opening)}
    {@const { format, conversion } = opening}
    <li>
      <p class="how">
        {#if conversion}
          {side === 'out' ? 'Opens in these' : 'Imports from these'} once you've converted
          <FormatChip format={conversion.from} /> to <FormatChip format={conversion.to} /> with
          <a href={conversion.href}>{conversion.tool}</a>
        {:else if side === 'out'}
          Opens in anything that reads <FormatChip {format} />
        {:else}
          Imports <FormatChip {format} /> from
        {/if}
      </p>
      <PathBadge kind={opening.kind} />
      <ul class="apps">
        {#each opening.services as service (service)}
          <li><ServiceLink {service} /></li>
        {/each}
        {#if opening.more}
          <li><a class="more" href="{format.href}#{rest}">and {opening.more} more</a></li>
        {/if}
      </ul>
    </li>
  {/each}
</ul>

<style>
  .openings {
    display: grid;
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule);

    > li {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-2) var(--space-4);
      align-items: center;
      padding-block: var(--space-3);
      border-block-end: var(--hairline) solid var(--rule);
    }
  }

  .how {
    flex: 1 1 20rem;
    line-height: 1.9;

    a {
      font-weight: 650;
    }
  }

  .apps {
    display: flex;
    flex-basis: 100%;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    align-items: center;
    list-style: none;
  }

  .more {
    font-size: var(--size-sm);
    font-weight: 650;
  }
</style>
