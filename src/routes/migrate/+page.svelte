<script lang="ts">
  import Facts from '#lib/components/Facts.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import PathBadge from '#lib/components/PathBadge.svelte';
  import RouteKey from '#lib/components/RouteKey.svelte';
  import Section from '#lib/components/Section.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import { pathKinds, type MigrationCard, type ServiceLink as Service } from '#lib/data/types.ts';
  import { count } from '#lib/text.ts';

  let { data } = $props();

  let from = $state('');
  let to = $state('');

  const all = $derived(data.groups.flatMap((group) => group.migrations));
  const facts = $derived([
    { label: 'Ways to move', value: String(all.length) },
    ...Object.entries(pathKinds).map(([id, label]) => ({
      label,
      value: String(all.filter(({ kind }) => kind.id === id).length)
    }))
  ]);

  const folded = (text: string) => text.toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '');
  const fits = (name: string, typed: string) => folded(name).includes(folded(typed.trim()));

  // the moves already come sorted by source, so each run of one source is a row
  function bySource(moves: MigrationCard[]) {
    const rows: { source: Service; moves: MigrationCard[] }[] = [];
    for (const move of moves) {
      const last = rows.at(-1);
      if (last?.source.id === move.source.id) last.moves.push(move);
      else rows.push({ source: move.source, moves: [move] });
    }
    return rows;
  }

  const groups = $derived(
    data.groups
      .map(({ category, migrations }) => ({
        category,
        rows: bySource(
          migrations.filter(
            (move) => fits(move.source.name, from) && fits(move.destination.name, to)
          )
        )
      }))
      .filter(({ rows }) => rows.length)
  );
  const shown = $derived(groups.flatMap(({ rows }) => rows.flatMap(({ moves }) => moves)).length);

  const reset = () => {
    from = '';
    to = '';
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

<PageHead title={data.meta.title} lede={data.meta.description}>
  <Facts items={facts} />
</PageHead>

<div class="find">
  <form
    class="toolbar needs-js"
    aria-label="Filter the moves"
    onsubmit={(event) => event.preventDefault()}
  >
    <label class="field">
      <span>From</span>
      <input type="search" bind:value={from} placeholder="Any app" autocomplete="off" />
    </label>
    <label class="field">
      <span>To</span>
      <input type="search" bind:value={to} placeholder="Any app" autocomplete="off" />
    </label>
    <p class="shown" aria-live="polite">Showing {shown} of {all.length}</p>
  </form>
  <RouteKey marks={false} />
</div>

{#each groups as group (group.category)}
  <Section id={group.category.id} title={group.category.name}>
    {#snippet aside()}
      <a href={group.category.href}>{group.category.name} apps</a>
    {/snippet}
    <div class="board">
      {#each group.rows as row (row.source)}
        <div class="row">
          <div class="from">
            <h3><ServiceLink service={row.source} size="md" /></h3>
            <p>Moves to {count(row.moves.length, 'app')}</p>
          </div>
          <ul class="to">
            {#each row.moves as move (move)}
              <li>
                <a href={move.href}>
                  <span class="lead"><Icon name="arrow" /></span>
                  <Tile name={move.destination.name} icon={move.destination.icon} size="sm" />
                  <span class="text">
                    <span class="name">
                      <span class="visually-hidden">Move from {row.source.name} to</span>
                      {move.destination.name}
                      {#if move.destination.category.id !== group.category.id}
                        <span class="category">
                          {move.destination.category.short ?? move.destination.category.name}
                        </span>
                      {/if}
                    </span>
                    <PathBadge kind={move.kind} />
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>
  </Section>
{:else}
  <p class="empty">
    Nothing matches that. <button type="button" onclick={reset}>Clear the filters</button>
  </p>
{/each}

<style>
  .find {
    display: grid;
    gap: var(--space-1);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-5);
    align-items: end;
    padding: var(--space-4);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
  }

  .field {
    display: grid;
    flex: 1 1 14rem;
    gap: var(--space-1);
    max-inline-size: 20rem;

    span {
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  input {
    block-size: 2.5rem;
    padding-inline: var(--space-3);
    border: var(--hairline) solid var(--control-edge);
    border-radius: 0;
    background: var(--surface-raised);
    font-size: var(--size-sm);

    &::placeholder {
      color: var(--text-muted);
      opacity: 1;
    }
  }

  .shown {
    margin-inline-start: auto;
    padding-block-end: var(--space-2);
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  .board {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: var(--hairline);
    border: var(--hairline) solid var(--rule);
    background: var(--rule);

    @media (width >= 48rem) {
      grid-template-columns: 15rem minmax(0, 1fr);
    }
  }

  .row {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    gap: var(--hairline);

    @media (width < 48rem) {
      gap: 0;
    }
  }

  .from {
    display: grid;
    align-content: start;
    gap: var(--space-1);
    padding: var(--space-4);
    background: var(--surface-raised);

    h3 {
      font-size: var(--size-md);
    }

    p {
      color: var(--text-muted);
      font-size: var(--size-sm);
    }

    @media (width < 48rem) {
      padding-block-end: var(--space-2);
    }
  }

  .to {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    list-style: none;

    li {
      display: flex;
      flex: 1 1 14rem;
    }

    a {
      display: flex;
      flex: 1;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3) var(--space-4);
      background: var(--surface-raised);
      text-decoration: none;
      transition: background-color var(--quick) var(--ease);

      &:hover {
        background: var(--surface-hover);

        .name {
          text-decoration: underline var(--accent) 2px;
          text-underline-offset: 0.22em;
        }

        :global(.tile) {
          border-color: var(--accent);
        }
      }

      &:focus-visible {
        outline-offset: -2px;
      }
    }

    @media (width < 48rem) {
      display: grid;
      gap: 0;
      padding: 0 0 var(--space-2) var(--space-4);
      background: var(--surface-raised);

      li + li {
        border-block-start: var(--hairline) solid var(--rule);
      }

      a {
        padding-inline: var(--space-2) var(--space-4);
      }
    }
  }

  .text {
    display: grid;
    gap: var(--space-1);
    min-inline-size: 0;
  }

  .lead {
    display: none;
    color: var(--text-muted);

    @media (width < 48rem) {
      display: inline-flex;
    }
  }

  .name {
    font-weight: 650;
  }

  .category {
    color: var(--text-muted);
    font-size: var(--size-sm);
    font-weight: 400;
  }

  .empty {
    padding: var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);

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
</style>
