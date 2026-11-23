<script lang="ts">
  import Caveats from '#lib/components/Caveats.svelte';
  import Facts from '#lib/components/Facts.svelte';
  import FormatChip from '#lib/components/FormatChip.svelte';
  import FormatChips from '#lib/components/FormatChips.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import Section from '#lib/components/Section.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import Steps from '#lib/components/Steps.svelte';
  import type { ConversionView, ServiceLink as Service } from '#lib/data/types.ts';
  import { source, symbol } from '#lib/text.ts';

  let { data } = $props();

  const format = $derived(data.format);
  const face = $derived(format.extensions[0] ?? symbol(format.name));
  const kind = $derived(format.standard ? 'Open format' : "One app's own");

  const facts = $derived([
    { label: 'Type', value: kind },
    { label: 'Extensions', value: format.extensions.join(', ') || 'None' },
    ...(format.basedOn ? [{ label: 'Built on', value: format.basedOn.name }] : []),
    ...(format.spec
      ? [{ label: 'Spec', value: source(format.spec).place, href: format.spec }]
      : []),
    { label: 'Exported by', value: format.exporters, unit: 'app', href: '#exporters' },
    { label: 'Imported by', value: format.importers, unit: 'app', href: '#importers' }
  ]);

  // the first section with format chips in it gets the key, if any of them are open
  const keyed = $derived(
    format.conversions.length ? 'to' : data.convertsFrom.length ? 'from' : 'related'
  );
  const open = $derived(
    [
      ...[...format.conversions, ...data.convertsFrom].flatMap(({ from, to }) => [from, to]),
      ...(format.basedOn ? [format.basedOn] : []),
      ...data.variants
    ].some(({ standard }) => standard)
  );
</script>

{#snippet services(list: Service[], empty: string)}
  {#if list.length}
    <ul class="services">
      {#each list as service (service)}
        <li><ServiceLink {service} category /></li>
      {/each}
    </ul>
  {:else}
    <p class="empty">{empty}</p>
  {/if}
{/snippet}

{#snippet conversion(item: ConversionView, title: string, id?: string)}
  <article class="chart conversion" {id}>
    <div class="cell head">
      <h3>{title}</h3>
      <a href={item.url} rel="external">With {item.tool}</a>
      <dl class="meta">
        <div>
          <dt>From</dt>
          <dd><FormatChip format={item.from} /></dd>
        </div>
        <div>
          <dt>To</dt>
          <dd><FormatChip format={item.to} /></dd>
        </div>
      </dl>
    </div>
    <div class="cell">
      <h4>Steps</h4>
      <Steps steps={item.steps} />
    </div>
    <div class="cell">
      <h4>Watch out for</h4>
      <Caveats items={item.limitations} />
    </div>
  </article>
{/snippet}

{#snippet key()}
  {#if open}<span class="open-key">Open format, so any app can read it</span>{/if}
{/snippet}

<PageHead title={data.heading} lede={format.description}>
  {#snippet figure()}
    <div class="plate" aria-hidden="true">
      <span class="kind" class:open={format.standard}>{kind}</span>
      <span class="face" class:extension={format.extensions.length} style:--length={face.length}>
        {face}
      </span>
      <span class="name">
        {format.name}
        {#if format.basedOn}<span>{format.basedOn.name} underneath</span>{/if}
      </span>
    </div>
  {/snippet}
  <Facts items={facts} />
</PageHead>

<div class="pair">
  <Section id="exporters" title="Apps that export it">
    {@render services(data.exporters, 'Nothing we list exports it yet.')}
  </Section>
  <Section id="importers" title="Apps that can import it">
    {@render services(data.importers, 'Nothing we list can import it yet.')}
  </Section>
</div>

{#if format.conversions.length}
  <Section id="convert-to" title="Convert it to another format">
    {#snippet aside()}{@render key()}{/snippet}
    {#each format.conversions as item (item)}
      {@render conversion(item, `To ${item.to.name}`, `to-${item.to.id}`)}
    {/each}
  </Section>
{/if}

{#if data.convertsFrom.length}
  <Section id="convert-from" title="Convert another format into it">
    {#snippet aside()}{#if keyed === 'from'}{@render key()}{/if}{/snippet}
    {#each data.convertsFrom as item (item)}
      {@render conversion(item, `From ${item.from.name}`)}
    {/each}
  </Section>
{/if}

{#if format.basedOn || data.variants.length}
  <Section id="related" title="Related formats">
    {#snippet aside()}{#if keyed === 'related'}{@render key()}{/if}{/snippet}
    <dl class="related">
      {#if format.basedOn}
        <div>
          <dt>Built on</dt>
          <dd><FormatChip format={format.basedOn} /></dd>
        </div>
      {/if}
      {#if data.variants.length}
        <div>
          <dt>Built on top of it</dt>
          <dd><FormatChips formats={data.variants} /></dd>
        </div>
      {/if}
    </dl>
  </Section>
{/if}

<style>
  .plate {
    display: grid;
    grid-template-areas: 'kind' 'face' 'name';
    grid-template-rows: auto 1fr auto;
    gap: var(--space-3);
    block-size: 100%;
    min-block-size: 12rem;
    padding: var(--space-4);

    @media (width < 40rem) {
      grid-template-areas: 'face name' 'face kind';
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-rows: auto auto;
      gap: var(--space-1) var(--space-4);
      min-block-size: 0;
      padding-block: var(--space-3);
    }
  }

  .kind {
    display: inline-flex;
    grid-area: kind;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-muted);
    font-size: var(--size-sm);

    &.open::before {
      content: '';
      inline-size: 0.5rem;
      block-size: 0.5rem;
      background: var(--accent);
    }
  }

  .face {
    grid-area: face;
    align-self: center;
    justify-self: center;
    max-inline-size: 100%;
    font-size: 3.25rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;

    &.extension {
      font-family: var(--font-data);
      font-size: min(3.25rem, calc(20rem / var(--length)));
      font-weight: 400;
    }

    @media (width < 40rem) {
      justify-self: start;
      font-size: 2rem;

      &.extension {
        font-size: min(2rem, calc(10rem / var(--length)));
      }
    }
  }

  .name {
    display: grid;
    grid-area: name;
    font-weight: 750;
    line-height: 1.25;

    span {
      color: var(--text-muted);
      font-size: var(--size-sm);
      font-weight: 400;
    }
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

  .services {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
    column-gap: var(--space-5);
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule);

    li {
      padding-block: var(--space-3);
      border-block-end: var(--hairline) solid var(--rule);
    }
  }

  .empty {
    padding: var(--space-4) var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
    color: var(--text-muted);
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

  .conversion {
    grid-template-columns: minmax(0, 1fr);

    @media (width >= 48rem) {
      grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);

      .head {
        grid-column: 1 / -1;
      }
    }
  }

  .cell {
    padding: var(--space-4) var(--space-5);
  }

  .head {
    display: grid;
    justify-items: start;
    gap: var(--space-2);

    h3 {
      font-size: var(--size-md);
    }

    a {
      font-size: var(--size-sm);
      font-weight: 650;
    }
  }

  h4 {
    margin-block-end: var(--space-3);
    font-size: var(--size-sm);
    font-weight: 750;
  }

  .meta,
  .related {
    display: grid;
    gap: var(--space-2);

    div {
      display: grid;
      grid-template-columns: 8rem minmax(0, 1fr);
      gap: var(--space-3);
      align-items: baseline;

      @media (width < 30rem) {
        grid-template-columns: minmax(0, 1fr);
        gap: var(--space-1);
      }
    }

    dt {
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  .meta {
    margin-block-start: var(--space-1);
  }

  .related {
    padding: var(--space-4) var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
  }
</style>
