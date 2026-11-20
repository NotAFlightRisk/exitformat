<script lang="ts">
  import { afterNavigate } from '$app/navigation';
  import { page } from '$app/state';
  import CategoryList from '#lib/components/CategoryList.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import SearchBox from '#lib/components/SearchBox.svelte';
  import Section from '#lib/components/Section.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import type { CategoryCard } from '#lib/data/types.ts';
  import { track } from '#lib/plausible.ts';
  import { site } from '#lib/site.ts';

  let { status, categories = [] }: { status: number; categories?: CategoryCard[] } = $props();

  const missing = $derived(status === 404);
  const bug = $derived(
    `${site.repo}/issues/new?template=bug_report.yml&title=${encodeURIComponent(
      `[Bug]: ${status} on ${page.url.pathname}`
    )}`
  );

  afterNavigate(() => {
    if (missing) track('404', { path: location.pathname });
  });
</script>

<svelte:head>
  <meta name="robots" content="noindex" />
</svelte:head>

<PageHead
  title={missing ? 'Page not found' : 'Something broke'}
  lede={missing
    ? "There's nothing at this address. It might have moved, or the link's got a typo in it."
    : "That's on us, not you. Give it a refresh, and if it keeps happening, let us know."}
>
  {#snippet figure()}
    <div class="plate" aria-hidden="true">
      <span class="status">{status}</span>
      <span class="sign"><StateMark state={missing ? 'unknown' : 'warning'} /></span>
      <span class="name">{missing ? 'No exit here' : 'Out of order'}</span>
    </div>
  {/snippet}
  <div class="next">
    <SearchBox size="large" />
    {#if missing}
      <p>
        Or head for the <a href="/categories">categories</a>, the <a href="/formats">formats</a> or
        <a href="/migrate">every way to move</a>.
      </p>
    {:else}
      <p><a href={bug} rel="external">Tell us on GitHub</a>, and say what you were doing.</p>
    {/if}
  </div>
</PageHead>

{#if missing && categories.length}
  <Section id="browse" title="Browse by category">
    <CategoryList {categories} />
  </Section>
{/if}

<style>
  .plate {
    display: grid;
    grid-template-areas: 'status' 'sign' 'name';
    grid-template-rows: auto 1fr auto;
    gap: var(--space-3);
    block-size: 100%;
    min-block-size: 12rem;
    padding: var(--space-4);

    @media (width < 40rem) {
      grid-template-areas: 'sign name' 'sign status';
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-rows: auto auto;
      gap: var(--space-1) var(--space-4);
      min-block-size: 0;
      padding-block: var(--space-3);
    }
  }

  .status {
    grid-area: status;
    color: var(--text-muted);
    font-size: var(--size-sm);
    font-variant-numeric: tabular-nums;
  }

  .sign {
    display: inline-flex;
    grid-area: sign;
    align-self: center;
    justify-self: center;
    font-size: 4rem;

    @media (width < 40rem) {
      font-size: 2rem;
    }
  }

  .name {
    grid-area: name;
    font-weight: 750;
    line-height: 1.25;
  }

  .next {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-5);

    p {
      color: var(--text-muted);
    }

    @media (width < 40rem) {
      padding: var(--space-4);
    }
  }
</style>
