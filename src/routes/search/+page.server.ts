import { categories } from '#lib/server/directory.ts';
import { categoryCard, crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Search',
    description: 'Search every service, file format and way to move in Exit Format.',
    // the results only exist in the browser, so there's nothing here for a search engine
    noindex: true
  },
  crumbs: crumbs({ name: 'Search', href: '/search' }),
  categories: categories().map(categoryCard)
});
