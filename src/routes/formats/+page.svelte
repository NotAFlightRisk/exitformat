<script lang="ts">
  import CategorySymbol from '#lib/components/CategorySymbol.svelte';
  import Facts from '#lib/components/Facts.svelte';
  import FormatChip from '#lib/components/FormatChip.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import MenuText from '#lib/components/MenuText.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import Section from '#lib/components/Section.svelte';
  import type { FormatCard } from '#lib/data/types.ts';
  import { count } from '#lib/text.ts';

  let { data } = $props();
</script>

{#snippet rows(formats: FormatCard[])}
  <div class="frame">
    <ul class="rows">
      <li class="labels" aria-hidden="true">
        <span>Format</span>
        <span>Extensions</span>
        <span>Exported by</span>
        <span>Imported by</span>
      </li>
      {#each formats as format (format)}
        <li>
          <div class="what">
            <h3><FormatChip {format} /></h3>
            <p><MenuText text={format.description} /></p>
          </div>
          <p class="extensions">
            <span class="label">Extensions</span>
            {#if format.extensions.length}
              <span class="data">{format.extensions.join(' ')}</span>
            {:else}
              <span class="none">No extension</span>
            {/if}
          </p>
          <p class="use" class:none={!format.exporters}>
            <span class="label">Exported by</span>
            {count(format.exporters, 'app')}
          </p>
          <p class="use" class:none={!format.importers}>
            <span class="label">Imported by</span>
            {count(format.importers, 'app')}
          </p>
        </li>
      {/each}
    </ul>
  </div>
{/snippet}

<PageHead title={data.meta.title} lede={data.meta.description}>
  <Facts
    items={[
      { label: 'Formats', value: data.open.length + data.own.total },
      { label: 'Open formats', value: data.open.length, href: '#open' },
      { label: "One app's own", value: data.own.total, href: '#own' }
    ]}
  />
</PageHead>

<Section id="open" title="Open formats">
  {#snippet aside()}
    <span class="open-key">Green marks an open format, so any app can read it</span>
  {/snippet}
  {@render rows(data.open)}
</Section>

<!-- grouped by category and closed, as there's one or more for nearly every app, but still on the
     page for search engines and find in page -->
<Section id="own" title="Formats that belong to one app">
  {#snippet aside()}Other apps only read these if someone's written an importer for them{/snippet}
  <div class="chart">
    {#each data.own.groups as { category, formats } (category)}
      <details id="own-{category?.id ?? 'other'}">
        <summary>
          <span class="chevron"><Icon name="chevron" /></span>
          <span class="symbol" aria-hidden="true">
            {#if category}<CategorySymbol id={category.id} name={category.name} />{/if}
          </span>
          <span class="name">{category?.name ?? 'Not used by any app we list'}</span>
          <span class="count">{count(formats.length, 'format')}</span>
        </summary>
        <div class="body">{@render rows(formats)}</div>
      </details>
    {/each}
  </div>
</Section>

<style>
  .open-key {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    &::before {
      content: '';
      inline-size: 0.5rem;
      block-size: 0.5rem;
      background: var(--accent);
    }
  }

  summary {
    display: grid;
    grid-template-columns: auto 1.5rem minmax(0, 1fr) auto;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    list-style: none;
    transition: background-color var(--quick) var(--ease);

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      background: var(--surface-hover);
    }

    /* on a phone the count goes under the name, to leave the name the whole line */
    @media (width < 40rem) {
      grid-template-columns: auto 1.5rem minmax(0, 1fr);
      row-gap: 0;

      .count {
        grid-column: 3;
      }
    }
  }

  .chevron {
    display: inline-flex;
    transition: rotate var(--quick) var(--ease);
  }

  .symbol {
    display: inline-flex;
    font-size: var(--size-base);
    font-weight: 800;
  }

  .name {
    font-size: var(--size-md);
    font-weight: 700;
  }

  .count {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  details[open] summary {
    background: var(--surface-sunken);

    .chevron {
      rotate: 90deg;
    }
  }

  /* the summary above and the panel's edge below already draw the list's top and bottom lines */
  .body {
    padding-inline: var(--space-4);

    .rows {
      border-block-start: 0;
    }

    li:last-child {
      border-block-end: 0;
    }
  }

  /* the formats slide down, where the browser can animate up to their full height, and just
     appear where it can't */
  @media (prefers-reduced-motion: no-preference) {
    details {
      interpolate-size: allow-keywords;

      &::details-content {
        block-size: 0;
        overflow: clip;
        transition:
          block-size 250ms var(--ease),
          content-visibility 250ms allow-discrete;
      }

      &[open]::details-content {
        block-size: auto;
      }
    }
  }

  .frame {
    container-type: inline-size;
  }

  .rows {
    display: grid;
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule-strong);
  }

  li {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    padding-block: var(--space-4);
    border-block-end: var(--hairline) solid var(--rule);
  }

  .labels {
    display: none;
  }

  .what {
    display: grid;
    flex-basis: 100%;
    justify-items: start;
    gap: var(--space-2);

    h3 {
      font-weight: 400;
    }

    p {
      max-inline-size: 60ch;
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  .extensions,
  .use {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: 0 var(--space-2);
    font-size: var(--size-sm);
  }

  .label,
  .none {
    color: var(--text-muted);
  }

  .data {
    font-family: var(--font-data);
    letter-spacing: -0.04em;
    overflow-wrap: anywhere;
  }

  @container (width >= 56rem) {
    .rows {
      grid-template-columns: minmax(0, 6fr) minmax(0, 2fr) minmax(0, 1.5fr) minmax(0, 1.5fr);
      column-gap: var(--space-5);
    }

    li {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
      align-items: start;
    }

    .labels {
      display: grid;
      padding-block: var(--space-2);
      color: var(--text-muted);
      font-size: var(--size-xs);
    }

    .label {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
</style>
