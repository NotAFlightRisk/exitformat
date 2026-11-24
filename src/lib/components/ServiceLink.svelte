<script lang="ts">
  import Tile from '#lib/components/Tile.svelte';
  import type { ServiceLink } from '#lib/data/types.ts';

  // unnamed, it shows just the icon, and keeps the name for screen readers and as a tooltip
  let {
    service,
    size = 'sm',
    category = false,
    named = true
  }: { service: ServiceLink; size?: 'sm' | 'md'; category?: boolean; named?: boolean } = $props();
</script>

<a class="service" class:bare={!named} href={service.href} title={named ? undefined : service.name}>
  <Tile name={service.name} icon={service.icon} {size} />
  <span class="name" class:visually-hidden={!named}>{service.name}</span>
  {#if category}
    <span class="category">{service.category.short ?? service.category.name}</span>
  {/if}
</a>

<style>
  .service {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-weight: 650;
    text-decoration: none;

    &:hover {
      .name {
        text-decoration: underline var(--accent) 2px;
        text-underline-offset: 0.22em;
      }

      :global(.tile) {
        border-color: var(--accent);
      }
    }
  }

  /* with no name to underline, the line goes under the icon instead */
  .bare {
    position: relative;

    &:hover::after {
      content: '';
      position: absolute;
      inset-inline: 0;
      inset-block-start: calc(100% + 0.22em);
      block-size: 2px;
      background: var(--accent);
    }
  }

  .category {
    color: var(--text-muted);
    font-size: var(--size-sm);
    font-weight: 400;
  }
</style>
