<script lang="ts">
  import CategoryList from '#lib/components/CategoryList.svelte';
  import Changes from '#lib/components/Changes.svelte';
  import MigrationList from '#lib/components/MigrationList.svelte';
  import SearchBox from '#lib/components/SearchBox.svelte';
  import Section from '#lib/components/Section.svelte';
  import { site } from '#lib/site.ts';
  import { plural } from '#lib/text.ts';

  let { data } = $props();

  const tallies = $derived.by(() => {
    const { services, categories, formats, migrations } = data.counts;
    return [
      { total: services, label: plural(services, 'service'), href: '/categories' },
      { total: categories, label: plural(categories, 'category', 'categories'), href: '/categories' },
      { total: formats, label: plural(formats, 'file format'), href: '/formats' },
      { total: migrations, label: plural(migrations, 'way to move', 'ways to move'), href: '/migrate' }
    ];
  });
</script>

<section class="intro chart" aria-labelledby="intro-title">
  <div class="pitch">
    <h1 id="intro-title">{site.tagline}</h1>
    <p class="lede">{site.description}</p>
    <SearchBox size="large" />
    <ul class="tallies" aria-label="What's in the directory">
      {#each tallies as tally (tally.label)}
        <li>
          <a href={tally.href}><data value={tally.total}>{tally.total}</data> {tally.label}</a>
        </li>
      {/each}
    </ul>
  </div>
  <div class="featured">
    <h2>Easiest moves</h2>
    <MigrationList moves={data.featured} key />
    <a class="more" href="/migrate">Every way to move</a>
  </div>
</section>

<Section id="categories" title="Browse by category">
  <CategoryList categories={data.categories} />
</Section>

<Section id="latest" title="Latest changes">
  {#snippet aside()}<a href="/changelog">The full changelog</a>{/snippet}
  {#if data.changes.length}
    <Changes changes={data.changes} />
  {:else}
    <p>Nothing's changed yet.</p>
  {/if}
</Section>

<style>
  .intro {
    grid-template-columns: minmax(0, 7fr) minmax(0, 5fr);

    @media (width < 60rem) {
      grid-template-columns: minmax(0, 1fr);
    }
  }

  .pitch {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-content: center;
    gap: var(--space-5);
    padding: var(--space-7) var(--space-6);

    @media (width < 40rem) {
      gap: var(--space-4);
      padding: var(--space-5) var(--space-4);
    }
  }

  h1 {
    font-size: var(--size-display);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.035em;
  }

  .lede {
    max-inline-size: 36ch;
    font-size: var(--size-md);
    line-height: 1.45;
  }

  .tallies {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    border: var(--hairline) solid var(--rule);
    background: var(--rule);
    list-style: none;

    li {
      display: flex;
      flex: 1 1 8rem;
    }

    a {
      display: grid;
      flex: 1;
      padding: var(--space-2) var(--space-4);
      background: var(--surface-raised);
      color: var(--text-muted);
      font-size: var(--size-sm);
      text-decoration: none;
      transition: background-color var(--quick) var(--ease);

      &:hover {
        background: var(--surface-hover);
        color: var(--text);
      }
    }

    data {
      color: var(--text);
      font-size: var(--size-lg);
      font-weight: 800;
      line-height: 1.2;
    }
  }

  .featured {
    display: grid;
    align-content: start;
    gap: var(--space-4);
    padding: var(--space-5) var(--space-5) var(--space-6);

    h2 {
      font-size: var(--size-md);
    }

    @media (width < 40rem) {
      padding-inline: var(--space-4);

      :global(.moves > li:nth-child(n + 4)) {
        display: none;
      }
    }
  }

  .more {
    justify-self: start;
    font-size: var(--size-sm);
    font-weight: 650;
  }
</style>
