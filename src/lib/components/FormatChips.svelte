<script lang="ts">
  import FormatChip from '#lib/components/FormatChip.svelte';
  import type { FormatLink } from '#lib/data/types.ts';

  let { formats }: { formats: FormatLink[] } = $props();
</script>

<ul class="formats">
  {#each formats as format (format)}
    <li><FormatChip {format} /></li>
  {/each}
</ul>

<style>
  .formats {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-2);
    list-style: none;
  }
</style>
