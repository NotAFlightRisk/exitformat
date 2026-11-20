<script lang="ts">
  import type { Snippet } from 'svelte';
  import MenuText from '#lib/components/MenuText.svelte';

  let {
    title,
    lede,
    figure,
    children
  }: { title: string; lede?: string; figure?: Snippet; children?: Snippet } = $props();
</script>

<header class="page-head chart" class:figured={figure}>
  {#if figure}<div class="figure">{@render figure()}</div>{/if}
  <div class="title">
    <h1>{title}</h1>
    {#if lede}<p class="lede"><MenuText text={lede} /></p>{/if}
  </div>
  {#if children}<div class="extra">{@render children()}</div>{/if}
</header>

<style>
  .page-head {
    grid-template-columns: minmax(0, 1fr);

    &.figured {
      grid-template-columns: minmax(9rem, 14rem) minmax(0, 1fr);

      .figure {
        grid-row: span 2;
      }

      @media (width < 40rem) {
        grid-template-columns: minmax(0, 1fr);

        .figure {
          grid-row: auto;
        }
      }
    }
  }

  .title {
    display: grid;
    gap: var(--space-3);
    padding: var(--space-6) var(--space-5) var(--space-5);

    @media (width < 40rem) {
      padding: var(--space-5) var(--space-4) var(--space-4);
    }
  }

  h1 {
    font-size: var(--size-xl);
    letter-spacing: -0.02em;
  }

  .lede {
    max-inline-size: var(--measure);
    color: var(--text-muted);
    font-size: var(--size-md);
    line-height: 1.45;

    @media (width < 40rem) {
      font-size: var(--size-base);
    }
  }

  .extra:empty {
    display: none;
  }
</style>
