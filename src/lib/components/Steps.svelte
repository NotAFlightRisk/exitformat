<script lang="ts">
  import type { Snippet } from 'svelte';
  import MenuText from '#lib/components/MenuText.svelte';

  let { steps, start = 1 }: { steps: (string | Snippet)[]; start?: number } = $props();
</script>

<ol
  class="steps"
  role="list"
  start={start > 1 ? start : undefined}
  style:counter-reset={start > 1 ? `step ${start - 1}` : undefined}
>
  {#each steps as step, index (index)}
    <li>
      <span
        >{#if typeof step === 'string'}<MenuText text={step} />{:else}{@render step()}{/if}</span
      >
    </li>
  {/each}
</ol>

<style>
  .steps {
    display: grid;
    gap: var(--space-3);
    list-style: none;
    counter-reset: step;
    max-inline-size: var(--measure);
  }

  li {
    display: grid;
    grid-template-columns: 1.55rem minmax(0, 1fr);
    gap: var(--space-3);
    align-items: start;
    overflow-wrap: anywhere;
    counter-increment: step;

    &::before {
      content: counter(step);
      display: grid;
      place-items: center;
      block-size: 1.55rem;
      background: var(--text);
      color: var(--surface-raised);
      font-size: var(--size-sm);
      font-variant-numeric: tabular-nums;
      font-weight: 700;
      line-height: 1;
    }
  }
</style>
