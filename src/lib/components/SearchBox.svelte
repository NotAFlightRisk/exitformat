<script lang="ts">
  import { afterNavigate, goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import Icon from '#lib/components/Icon.svelte';
  import SearchHit from '#lib/components/SearchHit.svelte';
  import { search, type SearchIndex, type SearchResult } from '#lib/search.ts';
  import { searchIndex } from '#lib/search-index.ts';
  import { count } from '#lib/text.ts';

  let {
    size = 'compact',
    placeholder = 'Search services and formats',
    label,
    value = $bindable(''),
    live = false
  }: {
    size?: 'compact' | 'large';
    placeholder?: string;
    /** names the search landmark, for a page with two of them */
    label?: string;
    value?: string;
    /** the page shows the results itself, so no suggestions underneath */
    live?: boolean;
  } = $props();

  const id = $props.id();
  const listbox = `${id}-suggestions`;
  const optionId = (at: number) => `${id}-option-${at}`;
  const few = 6;

  let mounted = $state(false);
  let index = $state<SearchIndex>();
  let open = $state(false);
  let active = $state(-1);

  const query = $derived(value.trim());
  const results = $derived(index && query ? search(index, query) : []);
  const options: { href: string; result?: SearchResult }[] = $derived(
    results.length
      ? [
          ...results.slice(0, few).map((result) => ({ href: result.href, result })),
          { href: `/search?q=${encodeURIComponent(query)}` }
        ]
      : []
  );
  const showing = $derived(open && Boolean(index && query));
  const expanded = $derived(showing && options.length > 0);
  const status = $derived(
    !showing ? '' : results.length ? count(results.length, 'result') : 'No results'
  );

  // a plain search form until the script turns up, then a combobox
  const combobox = $derived(
    mounted && !live
      ? {
          role: 'combobox',
          'aria-expanded': expanded,
          'aria-controls': listbox,
          'aria-autocomplete': 'list' as const,
          'aria-activedescendant': expanded && active >= 0 ? optionId(active) : undefined
        }
      : {}
  );

  onMount(() => (mounted = true));

  afterNavigate(({ type }) => {
    if (type === 'enter') return;
    open = false;
    active = -1;
    if (!live) value = '';
  });

  $effect(() => {
    if (expanded && active >= 0)
      document.getElementById(optionId(active))?.scrollIntoView({ block: 'nearest' });
  });

  async function wake() {
    if (live) return;
    open = true;
    index ??= await searchIndex().catch(() => undefined);
  }

  function close() {
    open = false;
    active = -1;
  }

  function move(step: number) {
    open = true;
    if (active < 0) active = step > 0 ? 0 : options.length - 1;
    else active = (active + step + options.length) % options.length;
  }

  function onkeydown(event: KeyboardEvent) {
    if (live) return;
    if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && options.length) {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && expanded && active >= 0) {
      event.preventDefault();
      goto(options[active].href);
    } else if (event.key === 'Escape' && expanded) {
      event.preventDefault();
      close();
    }
  }
</script>

<form
  class="search {size}"
  action="/search"
  method="get"
  role="search"
  aria-label={label}
  data-sveltekit-reset={live ? 'false' : undefined}
  data-sveltekit-replacestate={live ? '' : undefined}
>
  <label class="visually-hidden" for={id}>Search services and formats</label>
  <input
    {id}
    type="search"
    name="q"
    {placeholder}
    autocomplete="off"
    enterkeyhint="search"
    spellcheck="false"
    bind:value
    {...combobox}
    onfocus={wake}
    oninput={() => {
      open = true;
      active = -1;
    }}
    onblur={close}
    {onkeydown}
  />
  <button type="submit">
    <Icon name="search" />
    <span class="visually-hidden label">Search</span>
  </button>

  {#if mounted && !live}
    <div class="popup" hidden={!showing}>
      <div
        role="listbox"
        id={listbox}
        aria-label="Suggestions"
        tabindex="-1"
        hidden={!options.length}
        onpointerdown={(event) => event.preventDefault()}
      >
        {#each options as option, at (option.href)}
          <a
            role="option"
            id={optionId(at)}
            href={option.href}
            tabindex="-1"
            aria-selected={at === active}
            class:all={!option.result}
          >
            {#if option.result}
              <SearchHit result={option.result} tag />
            {:else}
              Every result for "{query}"
            {/if}
          </a>
        {/each}
      </div>
      {#if !options.length}
        <p class="none">Nothing we list matches "{query}".</p>
      {/if}
    </div>
    <p class="visually-hidden" role="status">{status}</p>
  {/if}
</form>

<style>
  .search {
    position: relative;
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

  .popup {
    position: absolute;
    inset-block-start: calc(100% + var(--space-1));
    inset-inline-end: 0;
    z-index: 2;
    display: grid;
    inline-size: max(100%, min(28rem, 100vw - 2 * var(--gutter)));
    max-block-size: min(30rem, 70dvh);
    overflow-y: auto;
    overscroll-behavior: contain;
    border: var(--hairline) solid var(--rule-strong);
    background: var(--surface-raised);

    &[hidden],
    [hidden] {
      display: none;
    }
  }

  [role='listbox'] {
    display: grid;
  }

  [role='option'] {
    display: flex;
    gap: var(--space-3);
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-block-end: var(--hairline) solid var(--rule);
    font-size: var(--size-sm);
    text-decoration: none;
    transition: background-color var(--quick) var(--ease);

    &:last-child {
      border-block-end: 0;
    }

    &:hover {
      background: var(--surface-hover);
    }

    &[aria-selected='true'] {
      background: var(--surface-hover);
      outline: 2px solid var(--accent);
      outline-offset: -2px;
    }

    &.all {
      padding-block: var(--space-3);
      font-weight: 650;
    }
  }

  .none {
    padding: var(--space-3);
    color: var(--text-muted);
    font-size: var(--size-sm);
  }
</style>
