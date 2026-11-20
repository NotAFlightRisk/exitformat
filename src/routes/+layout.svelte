<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import Breadcrumbs from '#lib/components/Breadcrumbs.svelte';
  import Logo from '#lib/components/Logo.svelte';
  import SearchBox from '#lib/components/SearchBox.svelte';
  import Seo from '#lib/components/Seo.svelte';
  import { ogCard, site } from '#lib/site.ts';

  let { children } = $props();

  const directory = [
    { href: '/categories', label: 'Categories' },
    { href: '/migrate', label: 'Migrate' },
    { href: '/formats', label: 'Formats' }
  ];

  const project = [
    { href: '/about', label: 'About' },
    { href: '/contribute', label: 'Contribute' },
    { href: '/changelog', label: 'Changelog' },
    { href: site.repo, label: 'GitHub' }
  ];

  const oops = $derived(page.status === 404 ? 'Page not found' : 'Something broke');
  const meta = $derived(
    page.data.meta ?? {
      title: page.error ? oops : site.name,
      description: site.description
    }
  );
  // home, search and the error pages bring their own big search box
  const ownSearch = $derived(
    ['/', '/search'].includes(page.url.pathname) || (page.data.status ?? page.status) >= 400
  );
  // a service page's crumbs run through Categories, so that's the tab it lights up
  const section = $derived(page.data.crumbs?.[1]?.href);
  const current = (href: string) =>
    page.url.pathname === href ? 'page' : section === href ? 'true' : undefined;
</script>

<Seo
  {...meta}
  path={page.url.pathname}
  crumbs={page.data.crumbs}
  card={ogCard(page.error ? null : page.route.id, page.url.pathname)}
/>

<a class="skip" href="#main">Skip to content</a>

<header class="masthead">
  <div class="wrap bar">
    <a class="home" href="/"><Logo /></a>
    <nav class="primary" aria-label="Main">
      <ul>
        {#each directory as item (item.href)}
          <li><a href={item.href} aria-current={current(item.href)}>{item.label}</a></li>
        {/each}
      </ul>
    </nav>
    {#if !ownSearch}
      <div class="find"><SearchBox /></div>
    {/if}
  </div>
</header>

{#if page.data.crumbs}
  <div class="wrap trail"><Breadcrumbs crumbs={page.data.crumbs} /></div>
{/if}

<main id="main" class="wrap" tabindex="-1">
  {@render children()}
</main>

<footer class="colophon">
  <div class="wrap">
    <div class="chart sheet">
      <div class="brand">
        <Logo />
        <p>{site.tagline} An open directory of how to get your data out of online services.</p>
      </div>
      <nav aria-label="Directory">
        <ul>
          {#each directory as item (item.href)}<li><a href={item.href}>{item.label}</a></li>{/each}
        </ul>
      </nav>
      <nav aria-label="Project">
        <ul>
          {#each project as item (item.href)}<li><a href={item.href}>{item.label}</a></li>{/each}
        </ul>
      </nav>
      <p class="licence">
        The code and the data are <a href="{site.repo}/blob/main/LICENSE">MIT licensed</a>, so take
        them wherever you like.
      </p>
    </div>
  </div>
</footer>

<style>
  .skip {
    position: absolute;
    inset-block-start: var(--space-2);
    inset-inline-start: var(--space-2);
    z-index: 10;
    padding: var(--space-2) var(--space-4);
    background: var(--text);
    color: var(--surface-raised);
    font-weight: 700;
    translate: 0 -200%;

    &:focus {
      translate: 0;
    }
  }

  .masthead {
    border-block-end: var(--hairline) solid var(--rule);
    background: var(--surface-raised);
  }

  .bar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) minmax(16rem, 24rem);
    min-block-size: 4rem;
  }

  .home {
    display: flex;
    align-items: center;
    padding-inline-end: var(--space-5);
    border-inline-end: var(--hairline) solid var(--rule);
    text-decoration: none;
  }

  .primary {
    ul {
      display: flex;
      block-size: 100%;
      list-style: none;
    }

    a {
      display: flex;
      align-items: center;
      block-size: 100%;
      padding-inline: var(--space-5);
      border-inline-end: var(--hairline) solid var(--rule);
      border-block-end: var(--rule-heavy) solid transparent;
      font-weight: 650;
      text-decoration: none;
      transition:
        background-color var(--quick) var(--ease),
        border-color var(--quick) var(--ease);

      &:hover {
        background: var(--surface-hover);
      }

      &[aria-current] {
        border-block-end-color: var(--accent);
      }
    }
  }

  .find {
    display: flex;
    align-items: center;
    padding-inline-start: var(--space-4);
  }

  .trail {
    padding-block: var(--space-4) 0;
  }

  main {
    display: grid;
    gap: var(--space-7);
    padding-block: var(--space-4) var(--space-8);

    &:focus {
      outline: 0;
    }
  }

  .colophon {
    padding-block-end: var(--space-6);
  }

  .sheet {
    grid-template-columns: minmax(0, 2fr) repeat(2, minmax(0, 1fr));

    > * {
      padding: var(--space-5);
    }
  }

  .brand {
    display: grid;
    align-content: start;
    gap: var(--space-3);

    p {
      max-inline-size: 40ch;
      color: var(--text-muted);
    }
  }

  nav ul {
    display: grid;
    gap: var(--space-2);
    list-style: none;
  }

  .licence {
    grid-column: 1 / -1;
    padding-block: var(--space-3);
    color: var(--text-muted);
    font-size: var(--size-sm);
  }

  @media (width < 40rem) {
    .trail {
      padding-block-start: var(--space-3);
    }

    main {
      gap: var(--space-6);
    }
  }

  @media (width < 52rem) {
    .bar {
      grid-template-columns: minmax(0, 1fr);
    }

    .home {
      padding-block: var(--space-2);
      border-inline-end: 0;
    }

    .primary {
      margin-inline: calc(var(--gutter) * -1);
      border-block-start: var(--hairline) solid var(--rule);

      ul {
        display: grid;
        grid-auto-columns: minmax(0, 1fr);
        grid-auto-flow: column;
      }

      a {
        justify-content: center;
        padding: var(--space-2);
      }

      li:last-child a {
        border-inline-end: 0;
      }
    }

    .find {
      padding: var(--space-2) 0;
      border-block-start: var(--hairline) solid var(--rule);
      margin-inline: calc(var(--gutter) * -1);
      padding-inline: var(--gutter);
    }

    .sheet {
      grid-template-columns: repeat(2, minmax(0, 1fr));

      .brand {
        grid-column: 1 / -1;
      }
    }
  }
</style>
