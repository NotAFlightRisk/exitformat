<script lang="ts">
  import { source } from '#lib/text.ts';

  let { docs, sources = [] }: { docs?: string; sources?: string[] } = $props();

  const links = $derived([
    ...(docs ? [{ url: docs, official: true }] : []),
    ...sources.map((url) => ({ url, official: false }))
  ]);
</script>

{#if links.length}
  <ul class="sources">
    {#each links as link (link)}
      {@const where = source(link.url)}
      <li>
        <span class="kind">
          {link.official ? 'Official docs' : where.archived ? 'Archived copy' : 'Evidence'}
        </span>
        <a href={link.url} rel="external">
          {where.place}{#if where.archived}<span class="when">, saved {where.archived}</span>{/if}
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .sources {
    display: grid;
    gap: var(--space-1);
    list-style: none;
    font-size: var(--size-sm);
  }

  li {
    display: grid;
    grid-template-columns: 7.5rem minmax(0, 1fr);
    gap: var(--space-3);

    @media (width < 30rem) {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }

  .kind {
    color: var(--text-muted);
  }

  a {
    overflow-wrap: anywhere;
  }

  .when {
    color: var(--text-muted);
  }
</style>
