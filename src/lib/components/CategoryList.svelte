<script lang="ts">
  import CategorySymbol from '#lib/components/CategorySymbol.svelte';
  import ServiceLink from '#lib/components/ServiceLink.svelte';
  import type { CategoryCard } from '#lib/data/types.ts';
  import { count } from '#lib/text.ts';

  let { categories, level = 3 }: { categories: CategoryCard[]; level?: 2 | 3 } = $props();
</script>

<ul class="categories">
  {#each categories as category (category)}
    {@const rest = category.services - category.examples.length}
    <li>
      <span class="element" aria-hidden="true">
        <span class="number">{category.services}</span>
        <span class="symbol"><CategorySymbol id={category.id} name={category.name} /></span>
      </span>
      <div class="text">
        <svelte:element this={`h${level}`}>
          <a class="title" href={category.href}>{category.name}</a>
        </svelte:element>
        <p class="description">{category.description}</p>
        {#if category.examples.length}
          <ul class="examples" aria-label="Some of its services">
            {#each category.examples as service (service)}
              <li><ServiceLink {service} named={false} /></li>
            {/each}
            {#if rest > 0}
              <li>
                <a class="more" href="{category.href}#services">
                  +{rest}<span class="visually-hidden"> more</span>
                </a>
              </li>
            {/if}
          </ul>
        {/if}
        <p class="counts">
          {count(category.services, 'service')} and
          {count(category.migrations, 'move guide')}
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

  .categories > li {
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

  /* the title's link stretches over the whole card */
  .title {
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

  li:hover .title {
    text-decoration: underline var(--accent) 2px;
    text-underline-offset: 0.22em;
  }

  .examples {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding-block: var(--space-1);
    list-style: none;

    /* flex, so each item is only as tall as its link, with no line of text around it */
    li {
      display: flex;
    }
  }

  /* the rest, counted on one more tile the size of the icons */
  .more {
    display: grid;
    place-items: center;
    min-inline-size: 1.75rem;
    block-size: 1.75rem;
    padding-inline: var(--space-1);
    border: var(--hairline) solid var(--rule-strong);
    font-size: var(--size-xs);
    font-weight: 800;
    text-decoration: none;
    transition: border-color var(--quick) var(--ease);

    &:hover {
      border-color: var(--accent);
    }
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
