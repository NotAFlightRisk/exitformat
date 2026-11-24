<script lang="ts" module>
  export type State = 'included' | 'excluded' | 'unknown' | 'warning';
</script>

<script lang="ts">
  import Icon, { type IconName } from '#lib/components/Icon.svelte';

  // plain drops the box and takes the state's colour, to lead each item in a list
  let { state, plain = false }: { state: State; plain?: boolean } = $props();

  const icons: Record<State, IconName> = {
    included: 'check',
    excluded: 'cross',
    unknown: 'unknown',
    warning: 'warning'
  };
</script>

<span class="mark {state}" class:plain style:--tone="var(--state-{state})" aria-hidden="true">
  <Icon name={icons[state]} />
</span>

<style>
  .mark {
    display: inline-grid;
    flex: none;
    place-items: center;
    inline-size: 1.25em;
    block-size: 1.25em;
    border: 1.5px solid currentColor;
    font-size: 0.875em;
  }

  .included,
  .warning {
    background: var(--text);
    border-color: var(--text);
    color: var(--surface-raised);
  }

  .unknown {
    border-style: dashed;
  }

  .plain {
    border: 0;
    background: none;
    color: var(--tone);
  }
</style>
