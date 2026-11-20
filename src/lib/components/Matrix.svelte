<script lang="ts">
  import PathBadge from '#lib/components/PathBadge.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import type { ServiceLink as Service, Term } from '#lib/data/types.ts';

  // via is the format a cell links to when there's no guide for the move
  type Cell = { href: string; kind: Term; via?: string } | null;

  let { services, rows }: { services: Service[]; rows: Cell[][] } = $props();

  let lit = $state<{ row: number; col: number } | null>(null);
  const on = (row: number, col: number) => () => (lit = { row, col });
  const off = () => (lit = null);
</script>

<div class="scroller">
  <table onpointerleave={off}>
    <caption class="visually-hidden">
      Each row is an app you can move from, each column an app you can move to
    </caption>
    <thead>
      <tr>
        <td class="corner">From, to</td>
        {#each services as service, col (service)}
          <th scope="col" class:lit={lit?.col === col}>
            <Tile name={service.name} icon={service.icon} size="sm" />
            <span class="visually-hidden">To {service.name}</span>
          </th>
        {/each}
      </tr>
    </thead>
    <tbody>
      {#each rows as row, rowIndex (services[rowIndex])}
        {@const from = services[rowIndex]}
        <tr>
          <th scope="row" class:lit={lit?.row === rowIndex}>
            <ServiceLink service={from} />
          </th>
          {#each row as cell, col (services[col])}
            <td
              class:self={rowIndex === col}
              class:lit={lit !== null && (lit.row === rowIndex || lit.col === col)}
              class:here={lit?.row === rowIndex && lit?.col === col}
              onpointerenter={on(rowIndex, col)}
            >
              {#if cell}
                <a href={cell.href} onfocus={on(rowIndex, col)} onblur={off}>
                  <span class="visually-hidden">
                    {#if cell.via}
                      {from.name} to {services[col].name} through {cell.via}:
                    {:else}
                      Move from {from.name} to {services[col].name}:
                    {/if}
                  </span>
                  <PathBadge kind={cell.kind} bare />
                </a>
              {:else if rowIndex !== col}
                <span class="visually-hidden"
                  >No way to move from {from.name} to {services[col].name} yet</span
                >
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .scroller {
    position: relative;
    overflow-x: auto;
    max-inline-size: 100%;
  }

  table {
    border-collapse: collapse;
    background: var(--surface-raised);
  }

  th,
  td {
    border: var(--hairline) solid var(--rule);
    transition: background-color var(--quick) var(--ease);
  }

  thead th,
  td {
    inline-size: 3.25rem;
    min-inline-size: 3.25rem;
    block-size: 3.25rem;
    padding: 0;
    text-align: center;
  }

  thead th :global(.tile) {
    margin: auto;
  }

  .corner,
  tbody th {
    position: sticky;
    inset-inline-start: 0;
    z-index: 1;
    background: var(--surface-raised);
  }

  .corner {
    padding-inline: var(--space-3);
    color: var(--text-muted);
    font-size: var(--size-xs);
    text-align: start;
  }

  tbody th {
    padding-inline: var(--space-3) var(--space-5);
    text-align: start;
    white-space: nowrap;

    @media (width < 40rem) {
      padding-inline-end: var(--space-3);

      :global(.name) {
        display: block;
        max-inline-size: 6.5rem;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  td a {
    display: grid;
    place-items: center;
    inline-size: 100%;
    block-size: 3.25rem;
  }

  .self {
    background: var(--surface-sunken);
  }

  .lit,
  tbody th.lit {
    background: var(--surface-hover);
  }

  .here {
    background: var(--accent-tint);
    outline: 2px solid var(--accent);
    outline-offset: -2px;
  }
</style>
