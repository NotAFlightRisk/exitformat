<script lang="ts">
  import Facts from '#lib/components/Facts.svelte';
  import FormatChip from '#lib/components/FormatChip.svelte';
  import Matrix from '#lib/components/Matrix.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import RouteKey from '#lib/components/RouteKey.svelte';
  import Section from '#lib/components/Section.svelte';
  import ServiceRows from '#lib/components/ServiceRows.svelte';
  import type { ServiceCard } from '#lib/data/types.ts';

  let { data } = $props();

  const category = $derived(data.category);
  const moves = $derived(data.matrix?.rows.flat().filter(Boolean).length);

  const sorts = {
    name: { label: 'Name', compare: () => 0 },
    formats: {
      label: 'Most export formats',
      compare: (a: ServiceCard, b: ServiceCard) => b.exports.length - a.exports.length
    },
    checked: {
      label: 'Recently checked',
      compare: (a: ServiceCard, b: ServiceCard) =>
        b.verification.checked.localeCompare(a.verification.checked)
    }
  };

  let query = $state('');
  let platforms = $state<string[]>([]);
  let deployments = $state<string[]>([]);
  let sort = $state<keyof typeof sorts>('name');

  const folded = (text: string) => text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');
  const shown = $derived(
    data.services
      .filter(
        (service) =>
          folded(service.name).includes(folded(query.trim())) &&
          (!platforms.length || service.platforms.some(({ id }) => platforms.includes(id))) &&
          (!deployments.length || deployments.includes(service.deployment.id))
      )
      .toSorted(sorts[sort].compare)
  );

  const reset = () => {
    query = '';
    platforms = [];
    deployments = [];
  };
</script>

<svelte:head>
  <noscript
    ><style>
      .needs-js {
        display: none !important;
      }
    </style></noscript
  >
</svelte:head>

<PageHead title={category.name} lede={category.description}>
  <Facts
    items={[
      { label: 'Services', value: String(data.services.length) },
      { label: 'Formats in use', value: String(data.formats.length) },
      ...(moves === undefined ? [] : [{ label: 'Ways to move', value: String(moves) }])
    ]}
  />
</PageHead>

<Section id="services" title="{category.name} apps">
  {#snippet aside()}
    <span class="needs-js" aria-live="polite">Showing {shown.length} of {data.services.length}</span
    >
  {/snippet}

  <form
    class="toolbar needs-js"
    aria-label="Filter and sort"
    onsubmit={(event) => event.preventDefault()}
  >
    <label class="field">
      <span>Name</span>
      <input type="search" bind:value={query} placeholder="Filter by name" autocomplete="off" />
    </label>
    {#if data.filters.platforms.length > 1}
      <fieldset>
        <legend>Works on</legend>
        {#each data.filters.platforms as platform (platform)}
          <label class="toggle">
            <input type="checkbox" value={platform.id} bind:group={platforms} />
            {platform.label}
          </label>
        {/each}
      </fieldset>
    {/if}
    {#if data.filters.deployments.length > 1}
      <fieldset>
        <legend>Runs</legend>
        {#each data.filters.deployments as deployment (deployment)}
          <label class="toggle">
            <input type="checkbox" value={deployment.id} bind:group={deployments} />
            {deployment.label}
          </label>
        {/each}
      </fieldset>
    {/if}
    <label class="field">
      <span>Sort by</span>
      <select bind:value={sort}>
        {#each Object.entries(sorts) as [id, { label }] (id)}
          <option value={id}>{label}</option>
        {/each}
      </select>
    </label>
  </form>

  {#if shown.length}
    <ServiceRows services={shown} />
  {:else}
    <p class="empty">
      Nothing here matches that. <button type="button" onclick={reset}>Clear the filters</button>
    </p>
  {/if}
</Section>

{#if data.matrix}
  <Section id="moves" title="Who can move to whom">
    {#snippet aside()}Read along a row to see where that app's data can go{/snippet}
    <Matrix services={data.matrix.services} rows={data.matrix.rows} />
    <RouteKey marks={false} blank />
  </Section>
{/if}

<div class="pair">
  <Section id="formats" title="Formats in use">
    <table class="formats">
      <thead>
        <tr>
          <th scope="col">Format</th>
          <th scope="col">Exported by</th>
          <th scope="col">Imported by</th>
        </tr>
      </thead>
      <tbody>
        {#each data.formats as format (format)}
          <tr>
            <th scope="row"><FormatChip {format} /></th>
            <td>{format.exporters}</td>
            <td>{format.importers}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Section>

  <Section id="tracked" title="What we look for">
    <p>
      Every export and import here says which of these it keeps, which it drops, and which nobody's
      sure about.
    </p>
    <ul class="tracked">
      {#each category.data as item (item)}<li>{item.label}</li>{/each}
    </ul>
  </Section>
</div>

<style>
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-5);
    align-items: end;
    padding: var(--space-4);
    background: var(--surface-raised);
    border: var(--hairline) solid var(--rule);
  }

  .field {
    display: grid;
    gap: var(--space-1);

    span {
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  input[type='search'],
  select {
    block-size: 2.5rem;
    padding-inline: var(--space-3);
    border: var(--hairline) solid var(--control-edge);
    border-radius: 0;
    background: var(--surface-raised);
    font-size: var(--size-sm);
  }

  input[type='search'] {
    inline-size: min(16rem, 100%);
  }

  fieldset {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin: 0;
    padding: 0;
    border: 0;

    legend {
      margin-block-end: var(--space-1);
      padding: 0;
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    block-size: 2.5rem;
    padding-inline: var(--space-3);
    border: var(--hairline) solid var(--control-edge);
    font-size: var(--size-sm);
    cursor: pointer;
    transition: background-color var(--quick) var(--ease);

    &:hover {
      background: var(--surface-hover);
    }

    &:has(:checked) {
      border-color: var(--text);
      background: var(--text);
      color: var(--surface-raised);
    }

    &:has(:focus-visible) {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }

    input {
      flex: none;
      inline-size: 0.75rem;
      block-size: 0.75rem;
      margin: 0;
      border: 1.5px solid currentColor;
      appearance: none;

      &:checked {
        background: currentColor;
      }

      &:focus-visible {
        outline: 0;
      }
    }
  }

  .empty {
    padding: var(--space-5);
    background: var(--surface-raised);
    border: var(--hairline) solid var(--rule);

    button {
      padding: 0;
      border: 0;
      background: none;
      font-weight: 700;
      text-decoration: underline;
      text-underline-offset: 0.22em;
      cursor: pointer;
    }
  }

  .pair {
    display: grid;
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
    gap: var(--space-7) var(--space-6);
    align-items: start;

    @media (width < 60rem) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .formats {
    inline-size: 100%;
    border-collapse: collapse;
    font-size: var(--size-sm);

    th,
    td {
      padding: var(--space-2) var(--space-3);
      border-block-end: var(--hairline) solid var(--rule);
      text-align: start;
      vertical-align: middle;
    }

    thead th {
      color: var(--text-muted);
      font-weight: 400;
      border-block-end-color: var(--rule-strong);
    }

    td {
      inline-size: 1%;
      font-variant-numeric: tabular-nums;
      text-align: end;
    }

    thead th:not(:first-child) {
      text-align: end;
      white-space: nowrap;
    }
  }

  .tracked {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    list-style: none;

    li {
      padding: var(--space-1) var(--space-3);
      border: var(--hairline) solid var(--rule-strong);
      background: var(--surface-raised);
      font-size: var(--size-sm);
    }
  }
</style>
