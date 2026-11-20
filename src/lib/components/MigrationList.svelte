<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';
  import PathBadge from '#lib/components/PathBadge.svelte';
  import RouteKey from '#lib/components/RouteKey.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import type { MigrationCard } from '#lib/data/types.ts';

  let {
    moves,
    show = 'both',
    key = false
  }: { moves: MigrationCard[]; show?: 'source' | 'destination' | 'both'; key?: boolean } =
    $props();
</script>

<div class="frame">
  <ul class="moves">
    {#each moves as move (move)}
      <li>
        <a class="route" href={move.href}>
          <span class="tiles">
            {#if show !== 'destination'}
              <Tile name={move.source.name} icon={move.source.icon} size="sm" />
            {/if}
            {#if show === 'both'}<Icon name="arrow" />{/if}
            {#if show !== 'source'}
              <Tile name={move.destination.name} icon={move.destination.icon} size="sm" />
            {/if}
          </span>
          <span class="title">Move from {move.source.name} to {move.destination.name}</span>
        </a>
        <PathBadge kind={move.kind} />
        <span class="carry">
          <span><StateMark state="included" /> {move.carried} carry over</span>
          <span><StateMark state="excluded" /> {move.lost} lost</span>
          <span><StateMark state="unknown" /> {move.unknown} not sure</span>
        </span>
      </li>
    {/each}
  </ul>
  {#if key}<RouteKey />{/if}
</div>

<style>
  .frame {
    container-type: inline-size;
  }

  .moves {
    display: grid;
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule);
  }

  li {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-4);
    align-items: center;
    padding-block: var(--space-3);
    border-block-end: var(--hairline) solid var(--rule);
  }

  .route {
    display: flex;
    flex-basis: 100%;
    align-items: center;
    gap: var(--space-3);
    font-weight: 700;
    text-decoration: none;

    &:hover {
      .title {
        text-decoration: underline var(--accent) 2px;
        text-underline-offset: 0.22em;
      }

      :global(.tile) {
        border-color: var(--accent);
      }
    }
  }

  .tiles {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: var(--space-1);
    color: var(--text-muted);
  }

  .carry {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-3);
    font-size: var(--size-sm);

    > span {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      white-space: nowrap;
    }
  }

  @container (width >= 46rem) {
    .moves {
      grid-template-columns: minmax(0, 1fr) auto auto;
      column-gap: var(--space-5);
    }

    li {
      display: grid;
      grid-column: 1 / -1;
      grid-template-columns: subgrid;
    }

    .route {
      flex-basis: auto;
    }
  }
</style>
