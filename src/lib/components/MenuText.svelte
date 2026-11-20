<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';

  let { text }: { text: string } = $props();

  // the data writes menu paths as "Settings --> Import", the page draws the arrow
  const parts = $derived(text.split(' --> '));
</script>

{#each parts as part, index (index)}{#if index}<span class="then"
      ><Icon name="arrow" /><span class="visually-hidden">, then </span></span
    >{/if}{part}{/each}

<style>
  .then {
    position: relative;
    display: inline-flex;
    margin-inline: 0.3em;
    color: var(--text-muted);
    vertical-align: -0.125em;
  }
</style>
