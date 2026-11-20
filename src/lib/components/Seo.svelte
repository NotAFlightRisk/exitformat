<script lang="ts">
  import JsonLd from '#lib/components/JsonLd.svelte';
  import type { Crumb } from '#lib/data/types.ts';
  import { websiteId } from '#lib/schema.ts';
  import { absolute, defaultCard, ogSize, site } from '#lib/site.ts';

  let {
    title,
    description,
    path,
    crumbs = [],
    card
  }: {
    title: string;
    description: string;
    path: string;
    crumbs?: Crumb[];
    card: string;
  } = $props();

  const url = $derived(absolute(path));
  // a page's own card leads with its title, and the default with the tagline
  const alt = $derived(card === defaultCard ? `${site.name}. ${site.tagline}` : title);
  const trail = $derived(crumbs.length > 1 ? `${url}#breadcrumb` : undefined);

  const graph = $derived({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': websiteId,
        url: absolute('/'),
        name: site.name,
        description: site.description,
        inLanguage: 'en-GB',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${absolute('/search')}?q={query}` },
          'query-input': 'required name=query'
        }
      },
      {
        '@type': 'WebPage',
        '@id': url,
        url,
        name: title,
        description,
        inLanguage: 'en-GB',
        isPartOf: { '@id': websiteId },
        breadcrumb: trail && { '@id': trail }
      },
      trail && {
        '@type': 'BreadcrumbList',
        '@id': trail,
        itemListElement: crumbs.map(({ name, href }, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name,
          item: absolute(href)
        }))
      }
    ].filter(Boolean)
  });
</script>

<svelte:head>
  <title>{path === '/' ? title : `${title} - ${site.name}`}</title>
  <meta name="description" content={description} />
  <link rel="canonical" href={url} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:locale" content="en_GB" />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:url" content={url} />
  <meta property="og:image" content={absolute(card)} />
  <meta property="og:image:width" content={String(ogSize.width)} />
  <meta property="og:image:height" content={String(ogSize.height)} />
  <meta property="og:image:alt" content={alt} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<JsonLd data={graph} />
