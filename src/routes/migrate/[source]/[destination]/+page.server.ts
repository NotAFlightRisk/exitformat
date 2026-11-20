import { error } from '@sveltejs/kit';
import { migration, migrations, migrationsFrom, migrationsTo } from '#lib/server/directory.ts';
import { andList, crumbs, migrationCard, pathView, serviceLink } from '#lib/server/views.ts';
import { href } from '#lib/site.ts';

export const entries = () =>
  migrations().map(({ source, destination }) => ({
    source: source.id,
    destination: destination.id
  }));

export const load = ({ params }) => {
  const found = migration(params.source, params.destination);
  if (!found) error(404, "We don't know a way between those two yet");
  const { source, destination } = found;
  const reverse = migration(destination.id, source.id);
  const paths = found.paths.map((path) => pathView(path, source, destination));
  const carried = andList(paths[0].carried.map(({ label }) => label.toLowerCase()));

  return {
    meta: {
      title: `Move from ${source.name} to ${destination.name}`,
      description: [
        `How to move your data from ${source.name} to ${destination.name}`,
        carried ? `, taking your ${carried},` : '',
        ' and what gets left behind.'
      ].join('')
    },
    crumbs: crumbs(
      { name: 'Migrate', href: '/migrate' },
      {
        name: `${source.name} to ${destination.name}`,
        href: href.migration(source.id, destination.id)
      }
    ),
    source: serviceLink(source),
    destination: serviceLink(destination),
    paths,
    reverse: reverse ? migrationCard(reverse) : null,
    moreFrom: migrationsFrom(source.id)
      .filter((other) => other !== found)
      .map(migrationCard),
    moreTo: migrationsTo(destination.id)
      .filter((other) => other !== found)
      .map(migrationCard)
  };
};
