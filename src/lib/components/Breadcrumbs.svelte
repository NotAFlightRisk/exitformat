<script lang="ts">
  import type { Crumb } from '#lib/data/types.ts';

  let { crumbs }: { crumbs: Crumb[] } = $props();
</script>

<nav class="crumbs" aria-label="Breadcrumb">
  <ol>
    {#each crumbs as crumb, index (crumb)}
      <li>
        <a href={crumb.href} aria-current={index === crumbs.length - 1 ? 'page' : undefined}>
          {crumb.name}
        </a>
      </li>
    {/each}
  </ol>
</nav>

<style>
  ol {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-2);
    list-style: none;
    font-size: var(--size-sm);
  }

  li {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);

    & + li::before {
      content: '/' / '';
      color: var(--text-muted);
    }
  }

  a {
    color: var(--text-muted);

    &[aria-current] {
      color: var(--text);
      font-weight: 650;
      text-decoration: none;
    }
  }
</style>
