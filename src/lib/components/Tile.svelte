<script lang="ts">
  import { symbol } from '#lib/text.ts';

  let {
    name,
    icon,
    size = 'md'
  }: { name: string; icon?: string | null; size?: 'sm' | 'md' } = $props();
</script>

<span class="tile {size}" class:lettered={!icon} aria-hidden="true">
  {#if icon}
    <img src={icon} alt="" loading="lazy" decoding="async" />
  {:else}
    {symbol(name)}
  {/if}
</span>

<style>
  .tile {
    --size: var(--tile);

    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: var(--size);
    block-size: var(--size);
    font-size: calc(var(--size) * 0.42);
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
    transition: border-color var(--quick) var(--ease);

    &.sm {
      --size: 1.75rem;
    }

    img {
      inline-size: 100%;
      block-size: 100%;
      object-fit: contain;
    }
  }

  /* an icon has a shape of its own, so only the letters standing in for one get a box */
  .lettered {
    border: var(--hairline) solid var(--rule-strong);
    background: var(--surface-raised);
  }
</style>
