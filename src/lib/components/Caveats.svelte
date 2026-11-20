<script lang="ts">
  import StateMark from '#lib/components/StateMark.svelte';

  let { items }: { items: string[] } = $props();
</script>

{#if items.length}
  {@const [first, ...rest] = items}
  <div class="caveats">
    <p class="first"><StateMark state="warning" /> <span>{first}</span></p>
    {#if rest.length}
      <ul>
        {#each rest as item, index (index)}<li>{item}</li>{/each}
      </ul>
    {/if}
  </div>
{:else}
  <p class="none">Nothing we know of.</p>
{/if}

<style>
  .caveats {
    display: grid;
    gap: var(--space-2);
    font-size: var(--size-sm);
  }

  .first {
    display: flex;
    gap: var(--space-2);
    font-weight: 650;
  }

  ul {
    display: grid;
    gap: var(--space-1);
    list-style: none;
  }

  li {
    position: relative;
    padding-inline-start: calc(1.25rem * 0.875 + var(--space-2));

    &::before {
      content: '';
      position: absolute;
      inset-inline-start: 0.375rem;
      inset-block-start: 0.6em;
      inline-size: 0.3125rem;
      block-size: 0.3125rem;
      background: var(--text-muted);
    }
  }

  .none {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }
</style>
