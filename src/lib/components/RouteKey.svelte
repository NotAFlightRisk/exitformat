<script lang="ts">
  import PathBadge from '#lib/components/PathBadge.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import { pathKinds } from '#lib/data/types.ts';

  let { marks = true, blank = false }: { marks?: boolean; blank?: boolean } = $props();
</script>

<ul class="key" aria-label="Key">
  {#each Object.entries(pathKinds) as [id, label] (id)}
    <li><PathBadge kind={{ id, label }} /></li>
  {/each}
  {#if marks}
    <li><StateMark state="included" /> Carries over</li>
    <li><StateMark state="excluded" /> Lost</li>
    <li><StateMark state="unknown" /> Not sure</li>
  {/if}
  {#if blank}
    <li><span class="blank"></span> No way that we know of</li>
  {/if}
</ul>

<style>
  .key {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2) var(--space-5);
    padding-block-start: var(--space-3);
    list-style: none;
    color: var(--text-muted);
    font-size: var(--size-sm);

    li {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }
  }

  .blank {
    inline-size: 1.25rem;
    block-size: 1.25rem;
    border: var(--hairline) solid var(--rule-strong);
    background: var(--surface-raised);
  }
</style>
