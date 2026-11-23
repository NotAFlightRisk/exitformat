<script lang="ts">
  import Changes from '#lib/components/Changes.svelte';
  import Checked from '#lib/components/Checked.svelte';
  import Facts from '#lib/components/Facts.svelte';
  import JsonLd from '#lib/components/JsonLd.svelte';
  import MenuText from '#lib/components/MenuText.svelte';
  import MigrationList from '#lib/components/MigrationList.svelte';
  import Openings from '#lib/components/Openings.svelte';
  import OptionPanel from '#lib/components/OptionPanel.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import RouteKey from '#lib/components/RouteKey.svelte';
  import Section from '#lib/components/Section.svelte';
  import Sources from '#lib/components/Sources.svelte';
  import Steps from '#lib/components/Steps.svelte';
  import { howTo } from '#lib/schema.ts';
  import { absolute, fixUrl, iconSize } from '#lib/site.ts';
  import { formatDate, source, symbol } from '#lib/text.ts';

  let { data } = $props();

  const service = $derived(data.service);
  const checked = $derived(service.verification);

  const facts = $derived([
    { label: 'Ways out', value: service.export.length, href: '#export' },
    { label: 'Formats you get', value: service.exports.length, href: '#export' },
    { label: 'Can move to', value: data.reach.out, unit: 'app', href: '#move' },
    {
      label: 'Checked',
      value: formatDate(checked.checked) + (checked.stale ? ', over a year ago' : ''),
      href: '#entry'
    },
    { label: 'Runs', value: service.deployment.label },
    { label: 'Works on', value: service.platforms.map(({ label }) => label).join(', ') },
    { label: 'Website', value: source(service.website).place, href: service.website },
    ...(service.source
      ? [{ label: 'Source code', value: source(service.source).place, href: service.source }]
      : [])
  ]);

  const contents = $derived([
    { id: 'export', label: 'Export', total: service.export.length },
    { id: 'import', label: 'Import', total: service.import.length },
    { id: 'move', label: 'Move to', total: data.reach.out },
    { id: 'bring', label: 'Bring in from', total: data.reach.in },
    ...(service.delete ? [{ id: 'delete', label: 'Delete your data' }] : []),
    { id: 'entry', label: 'About this entry' }
  ]);

  // one key a page, under the first list of moves
  const moving = $derived(data.moveTo.length + data.opensIn.length > 0);
  const guided = $derived(data.moveTo.length + data.bringFrom.length > 0);

  const guides = $derived({
    '@context': 'https://schema.org',
    '@graph': service.export.map((option) =>
      howTo(
        `${service.name}: ${option.name}`,
        absolute(`${service.href}#export-${option.id}`),
        option.steps
      )
    )
  });
</script>

{#if service.export.length}<JsonLd data={guides} />{/if}

<PageHead title={data.meta.title} lede={service.description}>
  {#snippet figure()}
    <div class="element" class:iconed={service.icon} aria-hidden="true">
      <span class="ways">{service.export.length}</span>
      {#if service.icon}
        <img src={service.icon} alt="" width={iconSize} height={iconSize} />
      {/if}
      <span class="symbol">{symbol(service.name)}</span>
      <span class="label">
        {service.name}
        <!-- out of the tab order, as the breadcrumb has the same link for keyboards -->
        <a href={service.category.href} tabindex="-1">
          {service.category.short ?? service.category.name}
        </a>
      </span>
    </div>
  {/snippet}
  <Facts items={facts} />
</PageHead>

<div class="record">
  <nav class="contents" aria-label="On this page">
    <ol>
      {#each contents as item (item.id)}
        <li>
          <a href="#{item.id}">
            {item.label}
            {#if item.total !== undefined}<data value={item.total}>{item.total}</data>{/if}
          </a>
        </li>
      {/each}
    </ol>
  </nav>

  <div class="sections">
    <Section id="export" title="{service.name} export options">
      {#snippet aside()}<span class="open-key">Open format, so any app can read it</span>{/snippet}
      {#each service.export as option (option)}
        <OptionPanel {option} kind="export" />
      {:else}
        <p class="empty">
          There's no official way to get your data out of {service.name} that we know of.
        </p>
      {/each}
    </Section>

    <Section id="import" title="Import into {service.name}">
      {#if service.import.length}
        <div class="chart">
          {#each service.import as option (option)}
            <OptionPanel {option} kind="import" collapsed />
          {/each}
        </div>
      {:else}
        <p class="empty">{service.name} can't import anything that we know of.</p>
      {/if}
    </Section>

    <Section id="move" title="Move from {service.name} to another app">
      {#if data.moveTo.length}<MigrationList moves={data.moveTo} show="destination" />{/if}
      {#if data.opensIn.length}<Openings openings={data.opensIn} side="out" />{/if}
      {#if moving}
        <RouteKey marks={guided} />
      {:else}
        <p class="empty">Nothing we list can take {service.name}'s exports yet.</p>
      {/if}
    </Section>

    <Section id="bring" title="Bring your data into {service.name}">
      {#if data.bringFrom.length}<MigrationList moves={data.bringFrom} show="source" />{/if}
      {#if data.takesFrom.length}<Openings openings={data.takesFrom} side="in" />{/if}
      {#if !data.bringFrom.length && !data.takesFrom.length}
        <p class="empty">Nothing we list can move into {service.name} yet.</p>
      {:else if !moving}
        <RouteKey marks={guided} />
      {/if}
    </Section>

    {#if service.delete}
      <Section id="delete" title="Delete your {service.name} data">
        <div class="chart deleting">
          <div class="cell"><Steps steps={service.delete.steps} /></div>
          {#if service.delete.notes.length}
            <ul class="cell notes">
              {#each service.delete.notes as note, index (index)}
                <li><MenuText text={note} /></li>
              {/each}
            </ul>
          {/if}
          {#if service.delete.docs}
            <div class="cell wide"><Sources docs={service.delete.docs} /></div>
          {/if}
        </div>
      </Section>
    {/if}

    <Section id="entry" title="About this entry">
      <div class="signoff">
        <Checked verification={service.verification} long />
        <p class="actions">
          <a href={fixUrl(service.name, service.href)} rel="external" target="_blank">
            Suggest an edit
          </a>
          <a href={service.edit} rel="external" target="_blank">Edit the file on GitHub</a>
          <a href={service.history} rel="external">Every change to this file</a>
        </p>
        {#if data.changes.length}
          <Changes changes={data.changes} named={false} />
        {/if}
      </div>
    </Section>
  </div>
</div>

<style>
  .element {
    display: grid;
    grid-template-areas: 'ways corner' 'middle middle' 'label label';
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto 1fr auto;
    block-size: 100%;
    min-block-size: 12rem;
    padding: var(--space-4);

    img {
      grid-area: middle;
      align-self: center;
      justify-self: center;
      inline-size: 6rem;
    }

    @media (width < 40rem) {
      grid-template-areas: 'middle label corner';
      grid-template-columns: auto minmax(0, 1fr) auto;
      grid-template-rows: auto;
      column-gap: var(--space-4);
      align-items: center;
      min-block-size: 0;
      padding-block: var(--space-2);

      img {
        inline-size: 2.75rem;
      }

      .symbol {
        font-size: 2.25rem;
      }

      .ways {
        display: none;
      }
    }
  }

  .ways {
    grid-area: ways;
    font-size: var(--size-sm);
  }

  .symbol {
    grid-area: middle;
    align-self: center;
    justify-self: center;
    font-size: clamp(3.5rem, 2.6rem + 3vw, 5.25rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.04em;
  }

  /* the icon takes the middle when there is one, and the symbol moves up to the corner */
  .iconed .symbol {
    grid-area: corner;
    justify-self: end;
    font-size: var(--size-lg);
    letter-spacing: -0.02em;
  }

  .label {
    display: grid;
    grid-area: label;
    font-weight: 750;
    line-height: 1.25;

    a {
      justify-self: start;
      color: var(--text-muted);
      font-size: var(--size-sm);
      font-weight: 400;
    }
  }

  .record {
    display: grid;
    grid-template-columns: 14rem minmax(0, 1fr);
    gap: var(--space-6);
    align-items: start;
  }

  .contents {
    position: sticky;
    inset-block-start: var(--space-4);
    display: grid;
    gap: var(--space-4);

    ol {
      display: grid;
      list-style: none;
      border-block-start: var(--rule-heavy) solid var(--rule-strong);
    }

    a {
      display: flex;
      justify-content: space-between;
      gap: var(--space-3);
      padding: var(--space-2) 0;
      border-block-end: var(--hairline) solid var(--rule);
      font-size: var(--size-sm);
      font-weight: 650;
      text-decoration: none;
      transition: color var(--quick) var(--ease);

      &:hover {
        color: var(--accent);
      }
    }

    data {
      color: var(--text-muted);
      font-weight: 400;
    }
  }

  .sections {
    display: grid;
    gap: var(--space-7);
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

  .empty {
    padding: var(--space-4) var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
    color: var(--text-muted);
  }

  .deleting {
    grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);

    .cell {
      padding: var(--space-4) var(--space-5);
    }

    .wide,
    .cell:only-child {
      grid-column: 1 / -1;
    }

    @media (width < 48rem) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .notes {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    list-style: none;
    font-size: var(--size-sm);

    li {
      position: relative;
      padding-inline-start: var(--space-4);

      &::before {
        content: '';
        position: absolute;
        inset-inline-start: 0;
        inset-block-start: 0.6em;
        inline-size: 0.3125rem;
        block-size: 0.3125rem;
        background: var(--text-muted);
      }
    }
  }

  .signoff {
    display: grid;
    gap: var(--space-4);
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    font-weight: 650;
  }

  @media (width < 60rem) {
    .record {
      grid-template-columns: minmax(0, 1fr);
    }

    .contents {
      position: static;

      ol {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        column-gap: var(--space-4);
      }
    }
  }
</style>
