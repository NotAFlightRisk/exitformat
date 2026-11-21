<script lang="ts">
  import StateMark, { type State } from '#lib/components/StateMark.svelte';
  import type { ScopeView, Term } from '#lib/data/types.ts';

  let { data, kind }: { data: ScopeView; kind: 'export' | 'import' | 'move' } = $props();

  type Group = { state: State; title: string; items?: Term[]; empty?: string };

  const titles = {
    export: ['Comes with it', 'Left behind'],
    import: ['Keeps', 'Drops'],
    move: ['Carries over', 'Lost']
  };

  const groups: Group[] = $derived([
    {
      state: 'included',
      title: titles[kind][0],
      items: data.included,
      empty: data.included ? 'Nothing' : "Whatever's in the file"
    },
    {
      state: 'excluded',
      title: titles[kind][1],
      items: data.excluded,
      empty: 'Nothing we know of'
    },
    ...(data.unknown?.length
      ? [{ state: 'unknown' as const, title: 'Not sure', items: data.unknown }]
      : [])
  ]);
</script>

<div class="scope">
  {#each groups as group (group.state)}
    <dl class="group">
      <dt>
        <StateMark state={group.state} />
        {group.title}
        {#if group.items}<data value={group.items.length}>{group.items.length}</data>{/if}
      </dt>
      {#each group.items ?? [] as item (item)}
        <dd>{item.label}</dd>
      {:else}
        <dd class="none">{group.empty}</dd>
      {/each}
    </dl>
  {/each}
</div>

<style>
  .scope {
    display: flex;
    flex-wrap: wrap;
    gap: var(--hairline);
    background: var(--rule);
  }

  .group {
    display: grid;
    flex: 1 1 12rem;
    align-content: start;
    gap: var(--space-1);
    padding: var(--space-4);
    background: var(--surface-raised);
  }

  dt {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-block-end: var(--space-1);
    font-weight: 700;

    data {
      margin-inline-start: auto;
      color: var(--text-muted);
      font-size: var(--size-sm);
      font-weight: 400;
    }
  }

  dd {
    margin: 0;
    padding-inline-start: calc(1.25rem * 0.875 + var(--space-2));
    font-size: var(--size-sm);
  }

  .none {
    color: var(--text-muted);
  }
</style>
