import { categories } from '#lib/server/directory.ts';
import { categoryCard } from '#lib/server/views.ts';
import { site } from '#lib/site.ts';

// prerendered as 404.html, which Cloudflare and nginx hand out for any page that isn't there,
// so it says what it stands for rather than the 200 it was built with
export const load = () => ({
  status: 404,
  meta: { title: 'Page not found', description: site.description },
  categories: categories().map(categoryCard)
});
