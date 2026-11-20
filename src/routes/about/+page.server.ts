import { formats, lastChecked, migrations, services } from '#lib/server/directory.ts';
import { crumbs } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'About Exit Format',
    description:
      "What Exit Format is and isn't, how every entry gets checked, what the marks on a move mean, and who runs it."
  },
  crumbs: crumbs({ name: 'About', href: '/about' }),
  counts: {
    services: services().length,
    formats: formats().length,
    migrations: migrations().length
  },
  checked: lastChecked()
});
