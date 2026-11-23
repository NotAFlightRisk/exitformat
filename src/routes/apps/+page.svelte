<script lang="ts">
  import Facts from '#lib/components/Facts.svelte';
  import JsonLd from '#lib/components/JsonLd.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import { absolute } from '#lib/site.ts';
  import { plural } from '#lib/text.ts';

  let { data } = $props();

  const facts = $derived([
    { label: 'Apps', value: data.apps.length },
    { label: 'Categories', value: data.counts.categories, href: '/categories' },
    { label: 'Move guides', value: data.counts.migrations, href: '/migrate' }
  ]);

  // tells search engines this page is the list of every app, in the order it shows them
  const list = $derived({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: data.meta.title,
    mainEntityOfPage: { '@id': absolute('/apps') },
    numberOfItems: data.apps.length,
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    itemListElement: data.apps.map((app, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: app.name,
      url: absolute(app.href)
    }))
  });
</script>

<JsonLd data={list} />

{#snippet stat(label: string, total: number, unit: string)}
  <div class:none={!total}>
    <dt>{label}</dt>
    <dd><data value={total}>{total}</data> {plural(total, unit)}</dd>
  </div>
{/snippet}

<PageHead title={data.meta.title} lede={data.meta.description}>
  <Facts items={facts} />
</PageHead>

<ul class="apps">
  {#each data.apps as app (app.id)}
    <li>
      <div class="who">
        <Tile name={app.name} icon={app.icon} />
        <h2><a class="title" href={app.href}>{app.name}</a></h2>
        <p class="category">{app.category.short ?? app.category.name}</p>
      </div>
      <dl class="stats">
        {@render stat('Exports', app.formats, 'format')}
        {@render stat('Moves to', app.moveTo, 'app')}
        {@render stat('Takes from', app.bringFrom, 'app')}
      </dl>
    </li>
  {/each}
</ul>

<style>
  /* every card the same width, each drawing its own edges so the slots a short last row leaves
     stay blank, clipped by the list so its border is the only line round the outside */
  .apps {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(18rem, 100%), 1fr));
    gap: var(--hairline);
    overflow: clip;
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
    list-style: none;

    > li {
      position: relative;
      display: grid;
      align-content: space-between;
      gap: var(--space-4);
      padding: var(--space-4) var(--space-5);
      outline: var(--hairline) solid var(--rule);
      transition: background-color var(--quick) var(--ease);

      &:hover {
        background: var(--surface-hover);

        .title {
          text-decoration: underline var(--accent) 2px;
          text-underline-offset: 0.22em;
        }
      }

      @media (width < 40rem) {
        gap: var(--space-3);
        padding-inline: var(--space-4);
      }
    }
  }

  .who {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    column-gap: var(--space-3);
    align-items: center;

    > :global(.tile) {
      grid-row: span 2;
    }
  }

  h2 {
    font-size: var(--size-md);
    line-height: 1.2;
  }

  /* the name's link stretches over the whole card */
  .title {
    text-decoration: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    &:focus-visible {
      outline: 0;

      &::after {
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }
    }
  }

  .category {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: var(--space-3);
    padding-block-start: var(--space-3);
    border-block-start: var(--hairline) solid var(--rule-soft);

    dt {
      color: var(--text-muted);
      font-size: var(--size-xs);
    }

    dd {
      margin: 0;
      font-size: var(--size-sm);
    }

    data {
      font-size: var(--size-md);
      font-weight: 760;
    }

    /* nothing to count, so it steps back */
    .none dd {
      color: var(--text-muted);

      data {
        font-weight: 400;
      }
    }
  }
</style>
