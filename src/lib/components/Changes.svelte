<script lang="ts">
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import type { ChangeView } from '#lib/data/types.ts';
  import { formatDate } from '#lib/text.ts';

  let { changes, named = true }: { changes: ChangeView[]; named?: boolean } = $props();

  const what = (change: ChangeView) =>
    change.sections.length
      ? `${change.kind.label}: ${change.sections.map(({ label }) => label.toLowerCase()).join(', ')}`
      : change.kind.label;
</script>

<ol class="changes" class:named>
  {#each changes as change (change)}
    <li>
      <time datetime={change.date}>{formatDate(change.date)}</time>
      {#if named}
        <span class="who">
          {#if change.service}<ServiceLink service={change.service} />{:else}{change.name}{/if}
        </span>
      {/if}
      <span class="what">{what(change)}</span>
      <a class="source" href={change.source.href} rel="external">
        <span class="visually-hidden">See the change</span>
        {change.source.label}
      </a>
    </li>
  {/each}
</ol>

<style>
  .changes {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr) auto;
    column-gap: var(--space-4);
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule);

    &.named {
      grid-template-columns: 7rem max-content minmax(0, 1fr) auto;

      @media (width < 40rem) {
        grid-template-columns: 7rem minmax(0, 1fr) auto;
      }
    }
  }

  li {
    display: grid;
    grid-column: 1 / -1;
    grid-template-columns: subgrid;
    grid-template-areas: 'time what source';
    row-gap: var(--space-1);
    align-items: center;
    padding-block: var(--space-2);
    border-block-end: var(--hairline) solid var(--rule);
    font-size: var(--size-sm);

    .named & {
      grid-template-areas: 'time who what source';

      @media (width < 40rem) {
        grid-template-areas:
          'who who source'
          'time what what';
      }
    }
  }

  time {
    grid-area: time;
  }

  .who {
    grid-area: who;
    font-size: var(--size-base);
  }

  .what {
    grid-area: what;
  }

  .source {
    grid-area: source;
  }

  time,
  .source {
    color: var(--text-muted);
  }

  .source {
    font-family: var(--font-data);
    letter-spacing: -0.04em;
  }
</style>
