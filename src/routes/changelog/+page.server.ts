import { changelog } from '#lib/server/directory.ts';
import { changeView, crumbs } from '#lib/server/views.ts';

// keeps the page light, every service's own page has its whole history
const limit = 500;

export const load = () => {
  const entries = changelog();
  return {
    meta: {
      title: 'Changelog',
      description: 'Every service added to, updated in or taken out of the directory, newest first.'
    },
    crumbs: crumbs({ name: 'Changelog', href: '/changelog' }),
    changes: entries.slice(0, limit).map(changeView),
    total: entries.length
  };
};
