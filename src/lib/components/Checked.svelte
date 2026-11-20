<script lang="ts">
  import StateMark from '#lib/components/StateMark.svelte';
  import type { Freshness } from '#lib/data/types.ts';
  import { formatDate } from '#lib/text.ts';

  let { verification, long = false }: { verification: Freshness; long?: boolean } = $props();

  const how: Record<string, string> = {
    documented: 'Checked against the official docs on',
    tested: 'Tested by hand on'
  };
</script>

<p class="checked" class:long>
  {#if long || verification.stale}
    <StateMark state={verification.stale ? 'warning' : 'included'} />
  {/if}
  <span>
    {long ? how[verification.status.id] : 'Checked'}
    <time datetime={verification.checked}>{formatDate(verification.checked)}</time>{#if verification.stale}<strong
        >, over a year ago, so it may be out of date</strong
      >{/if}{#if long}.{/if}
  </span>
</p>

<style>
  .checked {
    display: inline-flex;
    align-items: baseline;
    gap: var(--space-2);
    font-size: var(--size-sm);

    :global(.mark) {
      align-self: center;
    }

    &.long {
      font-size: var(--size-base);
    }
  }

  time {
    font-weight: 700;
  }

  strong {
    font-weight: 700;
  }
</style>
