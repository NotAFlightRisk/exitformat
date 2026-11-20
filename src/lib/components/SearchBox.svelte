<script lang="ts">
  import Icon from '#lib/components/Icon.svelte';

  let {
    size = 'compact',
    placeholder = 'Search services and formats'
  }: { size?: 'compact' | 'large'; placeholder?: string } = $props();

  const id = $props.id();
</script>

<form class="search {size}" action="/search" method="get" role="search">
  <label class="visually-hidden" for={id}>Search services and formats</label>
  <input {id} type="search" name="q" {placeholder} autocomplete="off" enterkeyhint="search" />
  <button type="submit">
    <Icon name="search" />
    <span class="visually-hidden label">Search</span>
  </button>
</form>

<style>
  .search {
    display: flex;
    inline-size: 100%;
  }

  input {
    flex: 1;
    inline-size: 100%;
    min-inline-size: 0;
    block-size: 2.5rem;
    padding-inline: var(--space-3);
    border: var(--hairline) solid var(--control-edge);
    border-inline-end: 0;
    border-radius: 0;
    background: var(--surface-raised);
    font-size: var(--size-sm);

    &::placeholder {
      color: var(--text-muted);
      opacity: 1;
    }

    &:focus-visible {
      outline-offset: -2px;
    }
  }

  button {
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    min-inline-size: 2.5rem;
    padding-inline: var(--space-3);
    border: var(--hairline) solid var(--text);
    border-radius: 0;
    background: var(--text);
    color: var(--surface-raised);
    font-weight: 700;
    cursor: pointer;
    transition:
      background-color var(--quick) var(--ease),
      border-color var(--quick) var(--ease);

    &:hover {
      border-color: var(--accent);
      background: var(--accent);
      color: var(--on-accent);
    }
  }

  .large {
    input,
    button {
      block-size: 3.5rem;
    }

    input {
      padding-inline: var(--space-4);
      font-size: var(--size-md);
    }

    button {
      padding-inline: var(--space-5);
      font-size: var(--size-md);
    }

    @media (width >= 30rem) {
      .label {
        position: static;
        inline-size: auto;
        block-size: auto;
        margin: 0;
        overflow: visible;
        clip-path: none;
      }
    }

    @media (width < 30rem) {
      input {
        font-size: var(--size-base);
      }
    }
  }
</style>
