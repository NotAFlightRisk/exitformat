<script lang="ts">
  import Tile from '#lib/components/Tile.svelte';
  import type { ServiceLink } from '#lib/data/types.ts';

  let {
    service,
    size = 'sm',
    category = false
  }: { service: ServiceLink; size?: 'sm' | 'md'; category?: boolean } = $props();
</script>

<a class="service" href={service.href}>
  <Tile name={service.name} icon={service.icon} {size} />
  <span class="name">{service.name}</span>
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

  .category {
    color: var(--text-muted);
    font-size: var(--size-sm);
    font-weight: 400;
  }
</style>
