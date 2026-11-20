<script lang="ts">
  import { page } from '$app/state';
  import { site } from '#lib/site.ts';

  let { children } = $props();

  const nav = [
    { href: '/categories', label: 'Categories' },
    { href: '/migrate', label: 'Migrate' },
    { href: '/formats', label: 'Formats' }
  ];
</script>

<svelte:head>
  <title>{page.data.meta?.title ?? site.name}</title>
  {#if page.data.meta}<meta name="description" content={page.data.meta.description} />{/if}
</svelte:head>

<a href="#main">Skip to content</a>

<header>
  <a href="/">{site.name}</a>
  <nav aria-label="Main">
    {#each nav as { href, label } (href)}
      <a {href} aria-current={page.url.pathname.startsWith(href) ? 'page' : undefined}>{label}</a>
    {/each}
  </nav>
</header>

{#if page.data.crumbs}
  <nav aria-label="Breadcrumb">
    <ol>
      {#each page.data.crumbs as crumb, index (crumb.href)}
        <li>
          <a
            href={crumb.href}
            aria-current={index === page.data.crumbs.length - 1 ? 'page' : undefined}
          >
            {crumb.name}
          </a>
        </li>
      {/each}
    </ol>
  </nav>
{/if}

<main id="main">
  {@render children()}
</main>

<footer>
  <p>{site.tagline}</p>
  <a href={site.repo} rel="external">Source on GitHub</a>
</footer>
