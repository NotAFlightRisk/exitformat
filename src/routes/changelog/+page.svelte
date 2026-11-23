<script lang="ts">
  import Changes from '#lib/components/Changes.svelte';
  import Facts from '#lib/components/Facts.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import Section from '#lib/components/Section.svelte';
  import { formatDate, formatMonth } from '#lib/text.ts';

  let { data } = $props();

  const months = $derived([...Map.groupBy(data.changes, ({ date }) => date.slice(0, 7))]);
  const latest = $derived(data.changes[0]?.date);
</script>

<PageHead title={data.meta.title} lede={data.meta.description}>
  {#if latest}
    <Facts
      items={[
        { label: 'Changes', value: data.total, href: '#changes' },
        { label: 'Latest', value: formatDate(latest) }
      ]}
    />
  {/if}
</PageHead>

<Section id="changes" title="Every change">
  {#snippet aside()}<a href="/feed.xml">Follow it as an Atom feed</a>{/snippet}
  {#each months as [month, changes] (month)}
    <section class="month" aria-labelledby="month-{month}">
      <h3 id="month-{month}">{formatMonth(month)}</h3>
      <Changes {changes} />
    </section>
  {:else}
    <p class="empty">Nothing's changed yet.</p>
  {/each}
  {#if data.total > data.changes.length}
    <p class="more">
      That's the latest {data.changes.length} of {data.total}. Every service's own page has its
      whole history.
    </p>
  {/if}
</Section>

<style>
  .month {
    display: grid;
    gap: var(--space-2);

    & + .month {
      margin-block-start: var(--space-4);
    }
  }

  h3 {
    font-size: var(--size-md);
  }

  .empty {
    padding: var(--space-4) var(--space-5);
    border: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
    color: var(--text-muted);
  }

  .more {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }
</style>
