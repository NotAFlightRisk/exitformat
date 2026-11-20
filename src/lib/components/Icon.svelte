<script lang="ts" module>
  const paths = {
    check: 'M3.5 8.25 6.5 11.25 12.5 4.75',
    cross: 'M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5',
    unknown: 'M5.75 6.25a2.25 2.25 0 1 1 3.2 2.05c-.6.3-.95.75-.95 1.4v.3M8 11.75v.75',
    warning: 'M8 3.5v6M8 11.75v.75',
    arrow: 'M2.5 8h10.5M9 4l4 4-4 4',
    external: 'M6 4h6v6M12 4l-7.5 7.5',
    chevron: 'M6 3.5 10.5 8 6 12.5',
    search: 'M7 11.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm3.25-1.25 3.25 3.25'
  };

  export type IconName = keyof typeof paths;
</script>

<script lang="ts">
  let { name }: { name: IconName } = $props();
</script>

<svg class="icon" viewBox="0 0 16 16" aria-hidden="true"><path d={paths[name]} /></svg>

<style>
  .icon {
    flex: none;
    inline-size: 1em;
    block-size: 1em;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.75;
    stroke-linecap: square;
  }
</style>
