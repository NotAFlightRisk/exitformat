<script lang="ts">
  import { meterFill, meterSteps, type MeterKind, type Term } from '#lib/data/types.ts';

  let { kind, bare = false }: { kind: Term<MeterKind>; bare?: boolean } = $props();

  const filled = $derived(meterFill[kind.id]);
</script>

<span class="path">
  <span class="meter" style:--tone="var(--path-{kind.id})" aria-hidden="true">
    {#each { length: meterSteps }, step}
      <span class:on={step < filled}></span>
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
      border: 1.5px solid var(--tone);
    }

    .on {
      background: var(--tone);
    }
  }
</style>
