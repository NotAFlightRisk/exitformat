<script lang="ts">
  let { steps, start = 1 }: { steps: string[]; start?: number } = $props();
</script>

<ol
  class="steps"
  role="list"
  start={start > 1 ? start : undefined}
  style:counter-reset={start > 1 ? `step ${start - 1}` : undefined}
>
  {#each steps as step, index (index)}
    <li>{step}</li>
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
    grid-template-columns: 1.55rem 1fr;
    gap: var(--space-3);
    align-items: start;
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
