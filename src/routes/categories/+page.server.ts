import { categories } from '#lib/server/directory.ts';
import { categoryCard, crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Every category',
    description:
      "Apps that do the same job can often read each other's exports. Each category shows which of its apps can, and in what format."
  },
  crumbs: crumbs({ name: 'Categories', href: '/categories' }),
  categories: categories().map(categoryCard)
});
