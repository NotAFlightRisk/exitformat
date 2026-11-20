import { categories, migrations, migrationsFrom, servicesIn } from '#lib/server/directory.ts';
import { categoryLink, crumbs, migrationCard } from '#lib/server/views.ts';

export const load = () => {
  const count = migrations().length;
  return {
    meta: {
      title: 'Move your data from one app to another',
      description: `${count} step-by-step guides to moving your data between apps, and what survives the trip.`
    },
    crumbs: crumbs({ name: 'Migrate', href: '/migrate' }),
    groups: categories()
      .map((found) => ({
        category: categoryLink(found),
        migrations: servicesIn(found.id)
          .flatMap(({ id }) => migrationsFrom(id))
          .map(migrationCard)
      }))
      .filter((group) => group.migrations.length)
  };
};
