import { error } from '@sveltejs/kit';
import { exporters, format, formats, importers } from '#lib/server/directory.ts';
import { conversionView, crumbs, formatCard, formatLink, serviceLink } from '#lib/server/views.ts';
import { href } from '#lib/site.ts';

export const entries = () => formats().map(({ id }) => ({ format: id }));

export const load = ({ params }) => {
  const found = format(params.format);
  if (!found) error(404, 'No format by that name');
  const extensions = found.extensions.length ? ` (${found.extensions.join(', ')})` : '';

  return {
    meta: {
      title: `${found.name}${extensions}: what it is and what opens it`,
      description: [
        found.description,
        `Which apps export ${found.name}, which import it, and how to convert it.`
      ].join(' ')
    },
    crumbs: crumbs(
      { name: 'Formats', href: '/formats' },
      { name: found.name, href: href.format(found.id) }
    ),
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
