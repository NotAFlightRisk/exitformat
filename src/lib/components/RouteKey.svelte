<script lang="ts">
  import PathBadge from '#lib/components/PathBadge.svelte';
  import StateMark from '#lib/components/StateMark.svelte';
  import { matrixKinds, pathKinds, terms } from '#lib/data/types.ts';

  // matrix adds the cells only the category matrix draws: no way across, and an app to itself
  let { marks = true, matrix = false }: { marks?: boolean; matrix?: boolean } = $props();

  const kinds = $derived([...terms(pathKinds), ...(matrix ? terms(matrixKinds) : [])]);
</script>

<ul class="key" aria-label="Key">
  {#each kinds as kind (kind.id)}
    <li><PathBadge {kind} /></li>
  {/each}
  {#if marks}
    <li><StateMark state="included" /> Carries over</li>
    <li><StateMark state="excluded" /> Lost</li>
    <li><StateMark state="unknown" /> Not sure</li>
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
</style>
