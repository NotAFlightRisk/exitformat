import { categories } from '#lib/server/directory.ts';
import { categoryCard, crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Every category',
    description:
      "Notes go to another notes app, 2FA codes to another authenticator. Each category shows which of its apps can read the others' exports, and in what format."
  },
  crumbs: crumbs({ name: 'Categories', href: '/categories' }),
  categories: categories().map(categoryCard)
});
