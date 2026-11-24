<script lang="ts">
  import { categoryIcon } from '#lib/category-icons.ts';
  import { initials } from '#lib/text.ts';

  let { id, name }: { id: string; name: string } = $props();

  const path = $derived(categoryIcon(id));
</script>

{#if path}
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d={path} /></svg>
{:else}
  {initials(name)}
{/if}

<style>
  /* sized from the font, so it fills the spot its initials would */
  svg {
    display: block;
    inline-size: 1.5em;
    block-size: 1.5em;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: square;
  }
</style>
