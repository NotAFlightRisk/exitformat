import { error } from '@sveltejs/kit';
import { better } from '#lib/data/compat.ts';
import type { Migration, PathView, Service } from '#lib/data/types.ts';
import {
  lastChecked,
  migration,
  migrations,
  migrationsFrom,
  migrationsTo,
  openingsFrom,
  openingsTo,
  pathsBetween
} from '#lib/server/directory.ts';
import {
  andList,
  crumbs,
  migrationCard,
  pathView,
  serviceCard,
  serviceLink
} from '#lib/server/views.ts';
import { href } from '#lib/site.ts';
import { count } from '#lib/text.ts';

// the full lists live on the service pages, so every move page doesn't carry them all
const few = 6;

export const entries = () =>
  migrations().map(({ source, destination }) => ({
    source: source.id,
    destination: destination.id
  }));

/** One line on what the best route means, for under the heading */
function meaning(path: PathView, { name: from }: Service, { name: to }: Service) {
  if (path.kind.id === 'direct') {
    if (path.export) return `${to} has an importer made just for ${from}'s export.`;
    return path.import.method.id === 'connect'
      ? `${to} has an importer made just for ${from}. It signs in and pulls your data across, so there's nothing to export first.`
      : `${to} has an importer made just for ${from} that reads its data directly, so there's nothing to export first.`;
  }
  if (path.conversion) {
    const { from: was, to: becomes, tool } = path.conversion;
    return `${from} and ${to} don't share a format, so you'll convert the ${was.name} into ${becomes.name} with ${tool} on the way.`;
  }
  const formats = andList(path.formats.map(({ name }) => name));
  return `${from} and ${to} both understand ${formats}, so you export a file from one and import it into the other.`;
}

export const load = ({ params }) => {
  const found = migration(params.source, params.destination);
  if (!found) error(404, "We don't know a way between those two yet");
  const { source, destination } = found;
  const reverse = migration(destination.id, source.id);
  const paths = found.paths.map((path) => pathView(path, source, destination));
  const [best] = paths;
  const lede = meaning(best, source, destination);
  const loses = best.lost.length
    ? `loses ${best.lost.length}, including ${best.lost[0].label.toLowerCase()}`
    : 'loses none that we know of';
  // a route's only as fresh as the older of its two entries
  const older = [source, destination].reduce((a, b) =>
    b.verification.checked_at < a.verification.checked_at ? b : a
  );
  const others = (list: Migration[]) =>
    list.filter((other) => other !== found).toSorted((a, b) => better(a.paths[0], b.paths[0]));
  const [moreFrom, moreTo] = [
    others(migrationsFrom(source.id)),
    others(migrationsTo(destination.id))
  ];

  return {
    meta: {
      title: `Move from ${source.name} to ${destination.name}`,
      description: best.carried.length
        ? `${lede} The move carries over ${count(best.carried.length, 'kind')} of data and ${loses}.`
        : lede,
      modified: lastChecked([source, destination])
    },
    crumbs: crumbs(
      { name: 'Migrate', href: '/migrate' },
      {
        name: `${source.name} to ${destination.name}`,
        href: href.migration(source.id, destination.id)
      }
    ),
    lede,
    source: serviceLink(source),
    destination: serviceLink(destination),
    paths,
    checked: serviceCard(older).verification,
    reverse: reverse ? migrationCard(reverse) : null,
    // no guide back, but the destination's files still open in the source
    wayBack:
      !reverse &&
      destination.category === source.category &&
      pathsBetween(destination, source).length > 0,
    moreFrom: moreFrom.slice(0, few).map(migrationCard),
    moreTo: moreTo.slice(0, few).map(migrationCard),
    totals: { from: openingsFrom(source).reach - 1, to: openingsTo(destination).reach - 1 }
  };
};
