<script lang="ts" module>
  export type Fact = { label: string; value: string; href?: string };
</script>

<script lang="ts">
  let { items }: { items: Fact[] } = $props();
</script>

<dl class="facts">
  {#each items as item (item)}
    <div>
      <dt>{item.label}</dt>
      <dd>
        {#if item.href}<a href={item.href} rel="external">{item.value}</a>{:else}{item.value}{/if}
      </dd>
    </div>
  {/each}
</dl>

<style>
  .facts {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    block-size: 100%;
    background: var(--rule);
  }

  div {
    display: grid;
    flex: 1 1 10rem;
    align-content: start;
    gap: var(--space-1);
    padding: var(--space-3) var(--space-5);
    background: var(--surface-raised);

    @media (width < 40rem) {
      padding: var(--space-2) var(--space-4);
    }
  }

  dt {
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  dd {
    margin: 0;
    font-weight: 650;
    overflow-wrap: anywhere;

    @media (width < 40rem) {
      font-size: var(--size-sm);
    }
  }
</style>
