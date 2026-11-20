<script lang="ts">
  import type { Term } from '#lib/data/types.ts';

  let { kind, bare = false }: { kind: Term; bare?: boolean } = $props();

  // how smooth the move is, out of three
  const ease: Record<string, number> = { direct: 3, file: 2, convert: 1 };
</script>

<span class="path">
  <span class="meter" aria-hidden="true">
    {#each [1, 2, 3] as cell (cell)}
      <span class:on={cell <= ease[kind.id]}></span>
    {/each}
  </span>
  <span class:visually-hidden={bare}>{kind.label}</span>
</span>

<style>
  .path {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--size-sm);
    white-space: nowrap;
  }

  .meter {
    display: inline-flex;
    gap: 2px;

    span {
      inline-size: 0.5rem;
      block-size: 0.875rem;
      border: 1.5px solid var(--accent);
    }

    .on {
      background: var(--accent);
    }
  }
</style>
