import { formats } from '#lib/server/directory.ts';
import { crumbs, formatCard } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'File formats',
    description: `The ${formats().length} file formats your data comes out in, and what opens them.`
  },
  crumbs: crumbs({ name: 'Formats', href: '/formats' }),
  formats: formats().map(formatCard)
});
