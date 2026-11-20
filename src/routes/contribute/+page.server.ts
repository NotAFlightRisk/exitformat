import { crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Add or fix a service',
    description: 'Every service is one YAML file on GitHub, so adding one is a pull request away.'
  },
  crumbs: crumbs({ name: 'Contribute', href: '/contribute' })
});
