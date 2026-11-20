<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    id,
    title,
    aside,
    children
  }: { id: string; title: string; aside?: Snippet; children: Snippet } = $props();
</script>

<section class="section" {id} aria-labelledby="{id}-title">
  <header>
    <h2 id="{id}-title">{title}</h2>
    {#if aside}<div class="aside">{@render aside()}</div>{/if}
  </header>
  {@render children()}
</section>

<style>
  .section {
    display: grid;
    gap: var(--space-4);
    align-content: start;
  }

  header {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    align-items: baseline;
    justify-content: space-between;
    padding-block-start: var(--space-3);
    border-block-start: var(--rule-heavy) solid var(--rule-strong);
  }

  h2 {
    font-size: var(--size-lg);
  }

  .aside {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }
</style>
