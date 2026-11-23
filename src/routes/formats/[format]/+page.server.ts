import { error } from '@sveltejs/kit';
import { exporters, format, formats, importers } from '#lib/server/directory.ts';
import {
  andList,
  conversionView,
  crumbs,
  formatCard,
  formatLink,
  serviceLink
} from '#lib/server/views.ts';
import { href } from '#lib/site.ts';

export const entries = () => formats().map(({ id }) => ({ format: id }));

export const load = ({ params }) => {
  const found = format(params.format);
  if (!found) error(404, 'No format by that name');
  // "Joplin Export File (JEX)" already says what it ends in
  const named = !found.extensions.length || found.name.endsWith(')');
  const heading = named ? found.name : `${found.name} (${found.extensions.join(', ')})`;
  const [made, read] = [exporters(found.id).length, importers(found.id).length];
  const uses = andList(
    [made ? `exported by ${made}` : '', read ? `imported by ${read}` : ''].filter((part) => part)
  );

  return {
    meta: {
      title: `${heading}: what it is and what opens it`,
      description: uses
        ? `${found.description} It's ${uses} of the apps we list.`
        : found.description
    },
    crumbs: crumbs(
      { name: 'Formats', href: '/formats' },
      { name: found.name, href: href.format(found.id) }
    ),
    heading,
    format: {
      ...formatCard(found),
      spec: found.spec,
      basedOn: found.based_on ? formatLink(found.based_on) : undefined,
      conversions: found.conversions.map((conversion) => conversionView(found.id, conversion))
    },
    exporters: exporters(found.id).map(serviceLink),
    importers: importers(found.id).map(serviceLink),
    convertsFrom: formats().flatMap((other) =>
      other.conversions
        .filter(({ to }) => to === found.id)
        .map((conversion) => conversionView(other.id, conversion))
    ),
    variants: formats()
      .filter(({ based_on }) => based_on === found.id)
      .map(({ id }) => formatLink(id))
  };
};
