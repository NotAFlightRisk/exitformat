<script lang="ts">
  import { page } from '$app/state';
  import { onMount } from 'svelte';
  import CategoryList from '#lib/components/CategoryList.svelte';
  import PageHead from '#lib/components/PageHead.svelte';
  import SearchBox from '#lib/components/SearchBox.svelte';
  import SearchHit from '#lib/components/SearchHit.svelte';
  import Section from '#lib/components/Section.svelte';
  import { search, type SearchIndex, type SearchResult } from '#lib/search.ts';
  import { searchIndex } from '#lib/search-index.ts';
  import { site } from '#lib/site.ts';
  import { count } from '#lib/text.ts';

  let { data } = $props();

  const titles: Record<SearchResult['kind'], string> = {
    migration: 'Move guides',
    service: 'Services',
    format: 'File formats',
    category: 'Categories'
  };
  const few = 8;

  let query = $state('');
  let index = $state<SearchIndex>();
  let failed = $state(false);
  let opened = $state<string[]>([]);
  let said = $state('');

  const typed = $derived(query.trim());
  const results = $derived(index && typed ? search(index, typed) : []);
  // whichever kind holds the best match goes first, so "notion to obsidian" leads with the move
  const groups = $derived(
    Object.entries(titles)
      .map(([kind, title]) => ({ kind, title, hits: results.filter((hit) => hit.kind === kind) }))
      .filter(({ hits }) => hits.length)
      .sort((a, b) => results.indexOf(a.hits[0]) - results.indexOf(b.hits[0]))
  );
  const summary = $derived.by(() => {
    if (!typed || failed) return '';
    if (!index) return 'Searching...';
    return `${results.length ? count(results.length, 'result') : 'No results'} for "${typed}"`;
  });
  const ask = $derived(
    `${site.repo}/issues/new?template=add-service.yml&name=${encodeURIComponent(typed)}`
  );

  onMount(() => {
    searchIndex()
      .then((found) => (index = found))
      .catch(() => (failed = true));
  });

  // the header search and the examples land here with ?q=, and so does the back button
  $effect(() => {
    query = page.url.searchParams.get('q') ?? '';
  });

  $effect(() => {
    void typed;
    opened = [];
  });

  // say the count once the typing stops, not on every key
  $effect(() => {
    const text = summary;
    const timer = setTimeout(() => (said = text), 400);
    return () => clearTimeout(timer);
  });

  // keep ?q= in step with the box, so a refresh, a shared link or the back button finds it
  function remember() {
    const url = new URL(location.href);
    if ((url.searchParams.get('q') ?? '') === typed) return;
    if (typed) url.searchParams.set('q', typed);
    else url.searchParams.delete('q');
    // kit's shallow goto waits a tick, and loses to a click on a result that's already going
    history.replaceState(history.state, '', url);
  }

  $effect(() => {
    void typed;
    const timer = setTimeout(remember, 400);
    return () => clearTimeout(timer);
  });
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
  <div class="box" onfocusout={remember}>
    <SearchBox size="large" bind:value={query} live />
    <p class="status" role="status">{said}</p>
  </div>
</PageHead>

<noscript>
  <p class="note">
    Search runs in your browser, so it needs JavaScript. Everything's linked from the categories
    below too.
  </p>
</noscript>

{#if failed}
  <p class="note">The search couldn't load just now. Give it a refresh, or browse below.</p>
{:else if !typed}
  <p class="note needs-js">
    Try <a href="/search?q=notion+to+obsidian">notion to obsidian</a>,
    <a href="/search?q=.jex">.jex</a> or <a href="/search?q=two-factor">two-factor</a>.
  </p>
{:else if index && !results.length}
  <div class="note nothing">
    <p class="lead">Nothing we list matches that.</p>
    <p>Check the spelling, or try just the app's name. A file extension like .jex works too.</p>
    <p>
      Not listed yet? <a href={ask} rel="external">Ask for it on GitHub</a>, or
      <a href="/contribute">add it yourself</a>.
    </p>
  </div>
{/if}

{#each groups as group (group.kind)}
  {@const shown = opened.includes(group.kind) ? group.hits : group.hits.slice(0, few)}
  <Section id={group.kind} title={group.title}>
    {#snippet aside()}{count(group.hits.length, 'match', 'matches')}{/snippet}
    <ul class="hits">
      {#each shown as result (result.href)}
        <li>
          <a href={result.href}><SearchHit {result} /></a>
        </li>
      {/each}
    </ul>
    {#if shown.length < group.hits.length}
      <button type="button" class="more" onclick={() => (opened = [...opened, group.kind])}>
        Show all {group.hits.length}
      </button>
    {/if}
  </Section>
{/each}

<Section id="browse" title="Browse by category">
  {#snippet aside()}
    Or see every <a href="/formats">file format</a> and <a href="/migrate">move guide</a>
  {/snippet}
  <CategoryList categories={data.categories} />
</Section>

<style>
  .box {
    display: grid;
    gap: var(--space-2);
    padding: var(--space-5);

    @media (width < 40rem) {
      padding: var(--space-4);
    }
  }

  .status {
    min-block-size: 1lh;
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  .note {
    max-inline-size: var(--measure);
    color: var(--text-muted);
  }

  .nothing {
    display: grid;
    gap: var(--space-2);
  }

  .lead {
    color: var(--text);
    font-size: var(--size-md);
    font-weight: 650;
  }

  .hits {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    column-gap: var(--space-5);
    list-style: none;
    border-block-start: var(--hairline) solid var(--rule);

    li {
      display: flex;
      border-block-end: var(--hairline) solid var(--rule);
    }

    a {
      display: flex;
      flex: 1;
      gap: var(--space-3);
      align-items: center;
      padding: var(--space-3) var(--space-2);
      text-decoration: none;
      transition: background-color var(--quick) var(--ease);

      &:hover {
        background: var(--surface-hover);

        :global(.name) {
          text-decoration: underline var(--accent) 2px;
          text-underline-offset: 0.22em;
        }
      }
    }
  }

  .more {
    justify-self: start;
    padding: 0;
    border: 0;
    background: none;
    font-weight: 700;
    text-decoration: underline;
    text-underline-offset: 0.22em;
    cursor: pointer;
  }
</style>
