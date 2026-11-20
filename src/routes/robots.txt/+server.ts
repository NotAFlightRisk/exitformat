import { absolute } from '#lib/site.ts';

export const prerender = true;

export const GET = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${absolute('/sitemap.xml')}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
