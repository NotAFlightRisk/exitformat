<script lang="ts">
  import Checked from '#lib/components/Checked.svelte';
  import DataScope from '#lib/components/DataScope.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import JsonLd from '#lib/components/JsonLd.svelte';
  import Journey from '#lib/components/Journey.svelte';
  import MigrationList from '#lib/components/MigrationList.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import PathBadge from '#lib/components/PathBadge.svelte';
  import RouteKey from '#lib/components/RouteKey.svelte';
  import RouteSides from '#lib/components/RouteSides.svelte';
  import Section from '#lib/components/Section.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import type { PathView } from '#lib/data/types.ts';
  import { howTo } from '#lib/schema.ts';
  import { absolute, editUrl, href } from '#lib/site.ts';
  import { count, symbol } from '#lib/text.ts';

  let { data } = $props();

  const source = $derived(data.source);
  const destination = $derived(data.destination);
  const best = $derived(data.paths[0]);
  const others = $derived(data.paths.slice(1));
  // one key a page, under the other routes if there are any, never under the way back
  const keyed = $derived(others.length ? 'others' : data.moreFrom.length ? 'from' : 'to');
  const conversion = $derived(best.conversion ? [best.conversion.from, best.conversion.to] : []);
  const open = $derived([...best.formats, ...conversion].some(({ standard }) => standard));

  const scope = (path: PathView) => ({
    included: path.carried,
    excluded: path.lost,
    unknown: path.unknown
  });

  const guide = $derived({
    '@context': 'https://schema.org',
    ...howTo(data.meta.title, absolute(href.migration(source.id, destination.id)), [
      ...(best.export?.steps ?? []),
      ...(best.conversion?.steps ?? []),
      ...best.import.steps
    ])
  });
</script>

<JsonLd data={guide} />

{#snippet via(path: PathView)}
  <span class="via">
    {#if path.export}
      <span>{path.export.name}</span>
      <span class="then"><Icon name="arrow" /><span class="visually-hidden">, then</span></span>
    {/if}
    {#if path.conversion}
      <span>Convert it with {path.conversion.tool}</span>
      <span class="then"><Icon name="arrow" /><span class="visually-hidden">, then</span></span>
    {/if}
    <span>{path.import.name}</span>
  </span>
{/snippet}

<PageHead title={data.meta.title} lede={data.lede}>
  {#snippet figure()}
    <div class="plate" aria-hidden="true">
      <span class="badge"><PathBadge kind={best.kind} /></span>
      <span class="symbols">
        {symbol(source.name)}
        <span class="arrow"><Icon name="arrow" /></span>
        {symbol(destination.name)}
      </span>
      <span class="names">
        {source.name} to {destination.name}
        <span>{count(data.paths.length, 'way across', 'ways across')}</span>
      </span>
    </div>
  {/snippet}
  <DataScope data={scope(best)} kind="move" />
</PageHead>

<Section id="how" title="How to move from {source.name} to {destination.name}">
  {#snippet aside()}
    {#if open}<span class="open-key">Open format, so any app can read it</span>{/if}
  {/snippet}
  <Journey path={best} {source} {destination} />
</Section>

<Section id="watch-out" title="What to watch out for">
  <RouteSides path={best} {source} {destination} sources={false} />
</Section>

<Section id="sources" title="Where this comes from">
  <RouteSides path={best} {source} {destination} caveats={false} />
  <div class="signoff">
    <Checked verification={data.checked} long />
    <p>
      We work this route out from the {source.name} and {destination.name} entries, so if something's
      wrong, the fix goes in one of those.
    </p>
    <p class="actions">
      <a href={editUrl(source.category.id, source.id)} rel="external">
        Edit the {source.name} entry
      </a>
      <a href={editUrl(destination.category.id, destination.id)} rel="external">
        Edit the {destination.name} entry
      </a>
    </p>
  </div>
</Section>

{#if others.length}
  <Section id="other-ways" title="Other ways to move from {source.name} to {destination.name}">
    {#snippet aside()}{count(others.length, 'more route', 'more routes')}{/snippet}
    <div>
      <div class="chart routes">
        {#each others as path (path)}
          <details>
            <summary>
              <span class="chevron"><Icon name="chevron" /></span>
              {@render via(path)}
              <span class="summary">
                <PathBadge kind={path.kind} />
                <span><StateMark state="included" /> {path.carried.length} carry over</span>
                <span><StateMark state="excluded" /> {path.lost.length} lost</span>
                <span><StateMark state="unknown" /> {path.unknown.length} not sure</span>
              </span>
            </summary>
            <div class="body">
              <div class="scope"><DataScope data={scope(path)} kind="move" /></div>
              <Journey {path} {source} {destination} headings={false} />
              <RouteSides {path} {source} {destination} headings={false} />
            </div>
          </details>
        {/each}
      </div>
      <RouteKey />
    </div>
  </Section>
{/if}

<Section id="back" title="Move from {destination.name} back to {source.name}">
  {#if data.reverse}
    <MigrationList moves={[data.reverse]} />
  {:else if data.wayBack}
    <p class="empty">
      There's no guide for the way back, but {destination.name}'s exports still open in {source.name}.
      <a href="{destination.href}#move">See where {destination.name} can go</a>.
    </p>
  {:else}
    <p class="empty">
      There's no way back from {destination.name} to {source.name} that we know of, so hang on to your
      {source.name} data until you're happy with the move.
    </p>
  {/if}
</Section>

<div class="pair">
  <Section id="more-from" title="Other places {source.name} can go">
    {#snippet aside()}
      {#if data.moreFrom.length && data.totals.from > data.moreFrom.length}
        <a href="{source.href}#move">Every place {source.name} can go</a>
      {/if}
    {/snippet}
    {#if data.moreFrom.length}
      <MigrationList moves={data.moreFrom} show="destination" key={keyed === 'from'} />
    {:else if data.totals.from}
      <p class="empty">
        There's no other guide out of {source.name}, but
        <a href="{source.href}#move">{count(data.totals.from, 'more app')}</a> can take its exports.
      </p>
    {:else}
      <p class="empty">Nothing else we list can take {source.name}'s exports yet.</p>
    {/if}
  </Section>

  <Section id="more-to" title="Other ways into {destination.name}">
    {#snippet aside()}
      {#if data.moreTo.length && data.totals.to > data.moreTo.length}
        <a href="{destination.href}#bring">Every way into {destination.name}</a>
      {/if}
    {/snippet}
    {#if data.moreTo.length}
      <MigrationList moves={data.moreTo} show="source" key={keyed === 'to'} />
    {:else if data.totals.to}
      <p class="empty">
        There's no other guide into {destination.name}, but it can import from
        <a href="{destination.href}#bring">{count(data.totals.to, 'more app')}</a>.
      </p>
    {:else}
      <p class="empty">Nothing else we list can move into {destination.name} yet.</p>
    {/if}
  </Section>
</div>

<style>
  .plate {
    display: grid;
    grid-template-areas: 'badge' 'symbols' 'names';
    grid-template-rows: auto 1fr auto;
    gap: var(--space-3);
    block-size: 100%;
    min-block-size: 12rem;
    padding: var(--space-4);

    @media (width < 40rem) {
      grid-template-areas: 'symbols names' 'symbols badge';
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-rows: auto auto;
      gap: var(--space-1) var(--space-4);
      min-block-size: 0;
      padding-block: var(--space-3);

      .symbols {
        font-size: 1.75rem;
      }
    }
  }

  .badge {
    grid-area: badge;
  }

  .symbols {
    display: inline-flex;
    grid-area: symbols;
    align-items: center;
    align-self: center;
    justify-self: center;
    gap: 0.2em;
    font-size: clamp(2.25rem, 1.75rem + 1.5vw, 3rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  .arrow {
    display: inline-flex;
    color: var(--text-muted);
    font-size: 0.5em;
  }

  .names {
    display: grid;
    grid-area: names;
    font-weight: 750;
    line-height: 1.25;

    span {
      color: var(--text-muted);
      font-size: var(--size-sm);
      font-weight: 400;
    }
  }

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

  .signoff {
    display: grid;
    gap: var(--space-3);

    p {
      max-inline-size: var(--measure);
    }
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-weight: 650;
  }

  details[open] summary {
    background: var(--surface-sunken);

    .chevron {
      rotate: 90deg;
    }
  }

  summary {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--space-1) var(--space-3);
    align-items: baseline;
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
  }

  .chevron {
    display: inline-flex;
    align-self: center;
    transition: rotate var(--quick) var(--ease);
  }

  .via {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-2);
    font-weight: 700;
  }

  .then {
    display: inline-flex;
    color: var(--text-muted);
  }

  .summary {
    display: flex;
    grid-column: 2;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-1) var(--space-4);
    color: var(--text-muted);
    font-size: var(--size-sm);

    > span:not(:first-child) {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      white-space: nowrap;
    }
  }

  .body {
    display: grid;
    gap: var(--space-4);
    padding: var(--space-4);
    border-block-start: var(--hairline) solid var(--rule);
    background: var(--surface-sunken);
  }

  .scope {
    border: var(--hairline) solid var(--rule);
  }

  .empty {
    padding: var(--space-4) var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
    color: var(--text-muted);
  }

  .pair {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-7) var(--space-6);
    align-items: start;

    @media (width < 60rem) {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
