import { categories, services } from '#lib/server/directory.ts';
import { andList, categoryCard, crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Every category',
    description: `How to get your data out of ${services().length} services, sorted into ${andList(
      categories().map(({ name }) => name.toLowerCase())
    )}.`
  },
  crumbs: crumbs({ name: 'Categories', href: '/categories' }),
  categories: categories().map(categoryCard)
});
