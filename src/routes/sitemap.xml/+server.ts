import {
  categories,
  changelog,
  exporters,
  formats,
  importers,
  lastChecked,
  migrations,
  services,
  servicesIn
} from '#lib/server/directory.ts';
import { absolute, href } from '#lib/site.ts';

export const prerender = true;

// the pages without a parameter, read off the routes so a new one can't be left out
const fixed = Object.keys(import.meta.glob('/src/routes/**/+page.svelte'))
  .map((file) => file.slice('/src/routes'.length, -'/+page.svelte'.length))
  .map((path) => path.replace(/\/\(.+?\)/g, '') || '/')
  .filter((path) => !path.includes('[') && path !== '/404');

// lastmod only where there's a real date behind it
export const GET = () => {
  const newest = lastChecked();
  const dated: Record<string, string | undefined> = {
    '/': newest,
    '/categories': newest,
    '/formats': newest,
    '/migrate': newest,
    '/changelog': changelog()[0]?.date
  };
  const pages = [
    ...fixed.map((path) => ({ path, modified: dated[path] })),
    ...categories().map(({ id }) => ({
      path: href.category(id),
      modified: lastChecked(servicesIn(id))
    })),
    ...services().map((service) => ({
      path: href.service(service.category, service.id),
      modified: service.verification.checked_at
    })),
    ...migrations().map(({ source, destination }) => ({
      path: href.migration(source.id, destination.id),
      modified: lastChecked([source, destination])
    })),
    ...formats().map(({ id }) => ({
      path: href.format(id),
      modified: lastChecked([...exporters(id), ...importers(id)])
    }))
  ];
  const urls = pages
    .map(
      ({ path, modified }) =>
        `<url><loc>${absolute(path)}</loc>${modified ? `<lastmod>${modified}</lastmod>` : ''}</url>`
    )
    .join('');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } }
  );
};
