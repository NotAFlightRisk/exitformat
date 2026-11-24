import {
  categories,
  migrations,
  openingsFrom,
  openingsTo,
  services
} from '#lib/server/directory.ts';
import { crumbs, serviceLink } from '#lib/server/views.ts';

export const load = () => ({
  meta: {
    title: 'Every app and how to export your data from it',
    description:
      "Check how you'd get your data out of an app before you spend years putting it in. Some export files many other apps can open, and some don't export at all."
  },
  crumbs: crumbs({ name: 'Apps', href: '/apps' }),
  counts: { categories: categories().length, migrations: migrations().length },
  // counted the way each app's own page counts them
  apps: services()
    .toSorted((a, b) => a.name.localeCompare(b.name, 'en-GB'))
    .map((found) => ({
      ...serviceLink(found),
      formats: new Set(found.export.flatMap(({ formats }) => formats)).size,
      moveTo: openingsFrom(found).reach,
      bringFrom: openingsTo(found).reach
    }))
});
