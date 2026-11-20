import { crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Search',
    description: 'Search every service, file format and way to move in Exit Format.'
  },
  crumbs: crumbs({ name: 'Search', href: '/search' })
});
