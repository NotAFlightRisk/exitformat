<script lang="ts">
  import DataScope from '#lib/components/DataScope.svelte';
  import FormatChips from '#lib/components/FormatChips.svelte';
  import Icon from '#lib/components/Icon.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import Sources from '#lib/components/Sources.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import Steps from '#lib/components/Steps.svelte';
  import type { OptionView } from '#lib/data/types.ts';

  let {
    option,
    kind,
    collapsed = false
  }: { option: OptionView; kind: 'export' | 'import'; collapsed?: boolean } = $props();

  const anchor = $derived(`${kind}-${option.id}`);
  // a collapsed option has no h3 above it, so its cell titles can't be h4s
  const title = $derived(collapsed ? 'p' : 'h4');
  const summary = $derived(
    [
      option.method.label,
      option.from.length && `built for ${option.from.map(({ name }) => name).join(', ')}`,
      ...option.formats.map(({ name }) => name)
    ]
      .filter(Boolean)
      .join(' · ')
  );
</script>

{#snippet details()}
  <div class="cell head">
    {#if !collapsed}<h3 id="{anchor}-title">{option.name}</h3>{/if}
    <dl class="meta">
      <div>
        <dt>How</dt>
        <dd>{option.method.label}</dd>
      </div>
      {#if option.formats.length}
        <div>
          <dt>Formats</dt>
          <dd><FormatChips formats={option.formats} /></dd>
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
              {#each option.requirements as need, index (index)}<li>{need}</li>{/each}
            </ul>
          </dd>
        </div>
      {/if}
    </dl>
  </div>

  <div class="cell steps" class:wide={!option.limitations.length}>
    <svelte:element this={title} class="cell-title">Steps</svelte:element>
    <Steps steps={option.steps} />
  </div>

  {#if option.limitations.length}
    {@const [first, ...rest] = option.limitations}
    <div class="cell caveats">
      <svelte:element this={title} class="cell-title">Watch out for</svelte:element>
      <p class="first"><StateMark state="warning" /> <span>{first}</span></p>
      {#if rest.length}
        <ul>
          {#each rest as limitation, index (index)}<li>{limitation}</li>{/each}
        </ul>
      {/if}
    </div>
  {/if}

  {#if option.data}
    <div class="cell scope"><DataScope data={option.data} {kind} /></div>
  {:else}
    <p class="cell unsaid">Nobody's said yet what this keeps and what it drops.</p>
  {/if}

  {#if option.docs || option.sources.length}
    <div class="cell evidence">
      <svelte:element this={title} class="cell-title">Sources</svelte:element>
      <Sources docs={option.docs} sources={option.sources} />
    </div>
  {/if}
{/snippet}

{#if collapsed}
  <details class="option" id={anchor}>
    <summary>
      <Icon name="chevron" />
      <span class="name">{option.name}</span>
      <span class="summary">{summary}</span>
    </summary>
    <div class="chart body">{@render details()}</div>
  </details>
{:else}
  <article class="option chart body" id={anchor} aria-labelledby="{anchor}-title">
    {@render details()}
  </article>
{/if}

<style>
  .option {
    container-type: inline-size;
  }

  .body {
    grid-template-columns: repeat(12, minmax(0, 1fr));

    > :global(*) {
      grid-column: 1 / -1;
    }
  }

  .cell {
    padding: var(--space-4) var(--space-5);
  }

  .head {
    display: grid;
    gap: var(--space-3);
  }

  h3 {
    font-size: var(--size-md);
  }

  .meta {
    display: grid;
    gap: var(--space-2);

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

  .cell-title {
    margin-block-end: var(--space-3);
    font-size: var(--size-sm);
    font-weight: 750;
  }

  .caveats {
    display: grid;
    align-content: start;
    gap: var(--space-2);
    font-size: var(--size-sm);

    .cell-title {
      margin-block-end: var(--space-1);
    }

    .first {
      display: flex;
      gap: var(--space-2);
      font-weight: 650;
    }

    ul {
      display: grid;
      gap: var(--space-1);
      list-style: none;
    }

    li {
      position: relative;
      padding-inline-start: calc(1.25rem * 0.875 + var(--space-2));

      &::before {
        content: '';
        position: absolute;
        inset-inline-start: 0.375rem;
        inset-block-start: 0.6em;
        inline-size: 0.3125rem;
        block-size: 0.3125rem;
        background: var(--text-muted);
      }
    }
  }

  .scope {
    padding: 0;
  }

  .unsaid {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  @container (width < 26rem) {
    .meta div {
      grid-template-columns: minmax(0, 1fr);
      gap: 0;
    }
  }

  @container (width >= 46rem) {
    .steps {
      grid-column: span 7;
    }

    .caveats {
      grid-column: span 5;
    }

    .steps.wide {
      grid-column: 1 / -1;
    }
  }

  details {
    background: var(--surface-raised);

    &[open] summary {
      background: var(--surface-sunken);

      :global(.icon) {
        rotate: 90deg;
      }
    }

    .body {
      border-inline: 0;
      border-block-end: 0;
    }
  }

  summary {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 0 var(--space-3);
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

    :global(.icon) {
      align-self: center;
      transition: rotate var(--quick) var(--ease);
    }

    .name {
      font-weight: 700;
    }

    .summary {
      grid-column: 2;
      color: var(--text-muted);
      font-size: var(--size-sm);
    }
  }
</style>
