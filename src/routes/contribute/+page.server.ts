import { crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Add or fix a service',
    description:
      'Every service is one YAML file on GitHub, so adding or fixing one is a few lines and a pull request. Or just open an issue.'
  },
  crumbs: crumbs({ name: 'Contribute', href: '/contribute' })
});
