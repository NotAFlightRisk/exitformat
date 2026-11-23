<script lang="ts" module>
  // a number shows large, with its unit after it made plural to match, and an href is another
  // site, another page here, or a #section further down this one
  export type Fact = { label: string; value: string | number; unit?: string; href?: string };
</script>

<script lang="ts">
  import { plural } from '#lib/text.ts';

  let { items }: { items: Fact[] } = $props();

  const offSite = (href: string) => /^https?:/.test(href);
</script>

{#snippet shown(item: Fact)}
  {#if typeof item.value === 'number'}
    <data value={item.value}>{item.value}</data>
    {#if item.unit}{plural(item.value, item.unit)}{/if}
  {:else}
    {item.value}
  {/if}
{/snippet}

<dl class="facts">
  {#each items as item (item)}
    <div>
      <dt>{item.label}</dt>
      <dd>
        {#if item.href}
          <a href={item.href} rel={offSite(item.href) ? 'external' : undefined}>
            {@render shown(item)}
          </a>
        {:else}
          {@render shown(item)}
        {/if}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    block-size: 100%;
    background: var(--rule);
  }

  div {
    display: grid;
    flex: 1 1 10rem;
    align-content: start;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-5);
    background: var(--surface-raised);

    @media (width < 40rem) {
      padding: var(--space-2) var(--space-4);
    }
  }

  dt {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  dd {
    margin: 0;
    font-weight: 650;
    overflow-wrap: anywhere;

    @media (width < 40rem) {
      font-size: var(--size-sm);
    }
  }

  data {
    font-size: var(--size-lg);
    font-weight: 760;
    line-height: 1.15;
  }
</style>
