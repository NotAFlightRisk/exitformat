import { categories } from '#lib/server/directory.ts';
import { categoryCard } from '#lib/server/views.ts';
import { site } from '#lib/site.ts';

// prerendered as 404.html, which Cloudflare and nginx hand out for any page that isn't there
export const load = () => ({
  meta: { title: 'Page not found', description: site.description },
  categories: categories().map(categoryCard)
});
