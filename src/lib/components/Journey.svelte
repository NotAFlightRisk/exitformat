<script lang="ts">
  import FormatChips from '#lib/components/FormatChips.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import MenuText from '#lib/components/MenuText.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import Steps from '#lib/components/Steps.svelte';
  import Tile from '#lib/components/Tile.svelte';
  import type {
    FormatLink,
    OptionView,
    PathView,
    ServiceLink as Service
  } from '#lib/data/types.ts';

  let {
    path,
    source,
    destination,
    headings = true
  }: { path: PathView; source: Service; destination: Service; headings?: boolean } = $props();

  // inside a collapsed route there's no heading above these, so they can't be h3s
  const title = $derived(headings ? 'h3' : 'p');
  const out = $derived(path.export?.steps.length ?? 0);
  const converting = $derived(path.conversion?.steps.length ?? 0);
  const signsIn = $derived(path.import.method.id === 'connect');
</script>

{#snippet facts(option: OptionView, formats: FormatLink[])}
  <dl class="meta">
    <div>
      <dt>How</dt>
      <dd>{option.method.label}</dd>
    </div>
    {#if formats.length}
      <div>
        <dt>{formats.length > 1 ? 'Formats' : 'Format'}</dt>
        <dd><FormatChips {formats} /></dd>
      </div>
    {/if}
    {#if option.from.length}
      <div>
        <dt>Built for</dt>
        <dd class="from">
          {#each option.from as service (service)}<ServiceLink {service} />{/each}
        </dd>
      </div>
    {/if}
    {#if option.requirements.length}
      <div>
        <dt>Needs</dt>
        <dd>
          <ul class="needs">
            {#each option.requirements as need, index (index)}
              <li><MenuText text={need} /></li>
            {/each}
          </ul>
        </dd>
      </div>
    {/if}
  </dl>
{/snippet}

<div class="journey">
  <div class="chart stages">
    <div class="cell head">
      <Tile name={source.name} icon={source.icon} />
      {#if path.export}
        <svelte:element this={title} class="title">Export from {source.name}</svelte:element>
        <a class="option" href="{source.href}#export-{path.export.id}">{path.export.name}</a>
        {@render facts(path.export, path.conversion ? [path.conversion.from] : path.formats)}
      {:else}
        <svelte:element this={title} class="title"
          >Nothing to export from {source.name}</svelte:element
        >
      {/if}
    </div>
    <div class="cell">
      {#if path.export}
        <Steps steps={path.export.steps} />
      {:else if signsIn}
        <p class="aside">
          {destination.name} signs in to {source.name} and pulls your data across itself.
        </p>
      {:else}
        <p class="aside">{destination.name}'s importer gets at {source.name}'s data itself.</p>
      {/if}
    </div>

    {#if path.conversion}
      <div class="cell head">
        <span class="tool" aria-hidden="true"><Icon name="arrow" /></span>
        <svelte:element this={title} class="title">
          Convert it to {path.conversion.to.name}
        </svelte:element>
        <a class="option" href={path.conversion.url} rel="external">With {path.conversion.tool}</a>
        <dl class="meta">
          <div>
            <dt>From</dt>
            <dd><FormatChips formats={[path.conversion.from]} /></dd>
          </div>
          <div>
            <dt>To</dt>
            <dd><FormatChips formats={[path.conversion.to]} /></dd>
          </div>
        </dl>
      </div>
      <div class="cell"><Steps steps={path.conversion.steps} start={out + 1} /></div>
    {/if}

    <div class="cell head">
      <Tile name={destination.name} icon={destination.icon} />
      <svelte:element this={title} class="title">Import into {destination.name}</svelte:element>
      <a class="option" href="{destination.href}#import-{path.import.id}">{path.import.name}</a>
      {@render facts(path.import, path.formats)}
    </div>
    <div class="cell"><Steps steps={path.import.steps} start={out + converting + 1} /></div>
  </div>
</div>

<style>
  .journey {
    container-type: inline-size;
  }

  .stages {
    grid-template-columns: minmax(0, 1fr);
  }

  .cell {
    padding: var(--space-4) var(--space-5);
  }

  .head {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--space-2) var(--space-3);
    align-content: start;
    align-items: center;

    .title,
    .option,
    .meta {
      grid-column: 2;
    }
  }

  .title {
    font-size: var(--size-md);
    font-weight: 760;
    line-height: 1.15;
  }

  .tool {
    display: inline-grid;
    place-items: center;
    inline-size: var(--tile);
    block-size: var(--tile);
    border: var(--hairline) solid var(--rule-strong);
    font-size: 1.125rem;
  }

  .option {
    justify-self: start;
    font-size: var(--size-sm);
    font-weight: 650;
  }

  .meta {
    display: grid;
    gap: var(--space-2);
    margin-block-start: var(--space-1);

    div {
      display: grid;
      grid-template-columns: 5.5rem minmax(0, 1fr);
      gap: var(--space-3);
      align-items: baseline;
    }

    dt {
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }

  .from {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .needs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-2);
    list-style: none;
    font-size: var(--size-sm);

    li {
      padding: 0.0625rem var(--space-2);
      background: var(--surface-sunken);
    }
  }

  .aside {
    max-inline-size: var(--measure);
    color: var(--text-muted);
  }

  @container (width < 26rem) {
    .meta div {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }

  @container (width >= 46rem) {
    .stages {
      grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    }
  }
</style>
