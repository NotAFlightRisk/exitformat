import { crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'About Exit Format',
    description:
      'An open directory of how to get your data out of online services, and where it can go.'
  },
  crumbs: crumbs({ name: 'About', href: '/about' })
});
