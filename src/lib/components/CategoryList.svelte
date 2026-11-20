<script lang="ts">
  import type { CategoryCard } from '#lib/data/types.ts';
  import { count, initials } from '#lib/text.ts';

  let { categories, level = 3 }: { categories: CategoryCard[]; level?: 2 | 3 } = $props();
</script>

<ul class="categories">
  {#each categories as category (category)}
    <li>
      <span class="element" aria-hidden="true">
        <span class="number">{category.services}</span>
        <span class="symbol">{initials(category.name)}</span>
      </span>
      <div class="text">
        <svelte:element this={`h${level}`}>
          <a href={category.href}>{category.name}</a>
        </svelte:element>
        <p class="description">{category.description}</p>
        <p class="counts">
          {count(category.services, 'service')} and
          {count(category.migrations, 'way to move', 'ways to move')}
        </p>
      </div>
    </li>
  {/each}
</ul>

<style>
  .categories {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    border: var(--hairline) solid var(--rule);
    background: var(--rule);
    list-style: none;
  }

  li {
    position: relative;
    display: grid;
    flex: 1 1 24rem;
    grid-template-columns: auto minmax(0, 1fr);
    gap: var(--space-5);
    align-items: start;
    padding: var(--space-5);
    background: var(--surface-raised);
    transition: background-color var(--quick) var(--ease);

    &:hover {
      background: var(--surface-hover);

      .element {
        border-color: var(--accent);
      }
    }
  }

  .element {
    display: grid;
    grid-template-rows: auto 1fr;
    inline-size: 5rem;
    block-size: 5rem;
    padding: var(--space-1) var(--space-2);
    border: var(--hairline) solid var(--rule-strong);
    background: var(--surface-raised);
    transition: border-color var(--quick) var(--ease);
  }

  .number {
    font-size: var(--size-xs);
    font-variant-numeric: tabular-nums;
  }

  .symbol {
    align-self: center;
    justify-self: center;
    font-size: 1.875rem;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
  }

  .text {
    display: grid;
    gap: var(--space-2);
  }

  h2,
  h3 {
    font-size: var(--size-lg);
  }

  a {
    text-decoration: none;

    &::after {
      content: '';
      position: absolute;
      inset: 0;
    }

    &:focus-visible {
      outline: 0;

      &::after {
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }
    }
  }

  li:hover a {
    text-decoration: underline var(--accent) 2px;
    text-underline-offset: 0.22em;
  }

  .description {
    max-inline-size: 52ch;
    color: var(--text-muted);
  }

  .counts {
    font-size: var(--size-sm);
    font-weight: 650;
  }
</style>
