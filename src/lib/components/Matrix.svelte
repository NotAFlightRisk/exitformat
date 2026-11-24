<script lang="ts">
  import PathBadge from '#lib/components/PathBadge.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import {
    matrixKinds,
    type MatrixKind,
    type PathKind,
    type ServiceLink as Service,
    type Term
  } from '#lib/data/types.ts';

  // via is the format a cell links to when there's no guide for the move
  type Cell = { href: string; kind: Term<PathKind>; via?: string } | null;

  let { services, rows }: { services: Service[]; rows: Cell[][] } = $props();

  // the kinds for a cell with no path: none across, or an app to itself
  const none: Term<MatrixKind> = { id: 'none', label: matrixKinds.none };
  const self: Term<MatrixKind> = { id: 'self', label: matrixKinds.self };

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
            {@const to = services[col]}
            <td
              class:self={rowIndex === col}
              class:lit={lit !== null && (lit.row === rowIndex || lit.col === col)}
              class:here={lit?.row === rowIndex && lit?.col === col}
              onpointerenter={on(rowIndex, col)}
            >
              {#if cell}
                <a class="spot" href={cell.href} onfocus={on(rowIndex, col)} onblur={off}>
                  <span class="visually-hidden">
                    {#if cell.via}
                      {from.name} to {to.name} through {cell.via}:
                    {:else}
                      Move from {from.name} to {to.name}:
                    {/if}
                  </span>
                  <PathBadge kind={cell.kind} bare />
                </a>
              {:else if rowIndex === col}
                <span class="spot"><PathBadge kind={self} bare /></span>
              {:else}
                <span class="spot">
                  <span class="visually-hidden">From {from.name} to {to.name}:</span>
                  <PathBadge kind={none} bare />
                </span>
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
    --cell: 3.25rem;
    --window: 80svh;

    position: relative;
    overflow: auto;
    max-inline-size: 100%;
    max-block-size: var(--window);
    scroll-padding-block-start: var(--cell);
  }

  table {
    border-collapse: separate;
    border-spacing: 0;
    background: var(--surface-raised);
  }

  /* every cell owns its lines, pinned ones included */
  th,
  td {
    border: 0 solid var(--rule);
    border-inline-end-width: var(--hairline);
    border-block-end-width: var(--hairline);
    transition: background-color var(--quick) var(--ease);
  }

  thead :is(th, td) {
    border-block-start-width: var(--hairline);
  }

  :is(th, td):first-child {
    border-inline-start-width: var(--hairline);
  }

  thead th,
  td {
    inline-size: var(--cell);
    min-inline-size: var(--cell);
    block-size: var(--cell);
    padding: 0;
    text-align: center;
  }

  thead th :global(.tile) {
    margin: auto;
  }

  thead th,
  .corner,
  tbody th {
    position: sticky;
    z-index: 1;
    background: var(--surface-raised);
  }

  thead th,
  .corner {
    inset-block-start: 0;
  }

  .corner,
  tbody th {
    inset-inline-start: 0;
  }

  .corner {
    z-index: 2;
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

  /* every cell's meter sits in the middle, linked or not */
  .spot {
    display: grid;
    place-items: center;
    inline-size: 100%;
    block-size: var(--cell);
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
