<script lang="ts">
  import type { FormatLink } from '#lib/data/types.ts';
  import { formatMark, viewBox } from '#lib/format-icons.ts';

  // an open format's green mark, or the icon of the app it belongs to, sized by the text
  let { format }: { format: FormatLink } = $props();

  const mark = $derived(format.mark && formatMark(format.mark));
</script>

{#if format.icon}
  <img class="mark" src={format.icon} alt="" loading="lazy" decoding="async" />
{:else if mark}
  <svg class="mark" class:filled={mark.filled} viewBox={viewBox(mark)} aria-hidden="true">
    <path d={mark.d} />
  </svg>
{:else if format.standard}
  <span class="square" aria-hidden="true"></span>
{/if}

<style>
  .mark {
    flex: none;
    inline-size: 1.25em;
    block-size: 1.25em;
  }

  svg {
    color: var(--accent);
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: square;
  }

  .filled {
    fill: currentColor;
    fill-rule: evenodd;
    stroke: none;
  }

  /* an open format with no mark yet keeps the plain square */
  .square {
    flex: none;
    inline-size: 0.5rem;
    block-size: 0.5rem;
    background: var(--accent);
  }
</style>
