import {
  categories,
  formats,
  lastChecked,
  migrations,
  migrationsFrom,
  services,
  servicesIn
} from '#lib/server/directory.ts';
import { andList, serviceCard } from '#lib/server/views.ts';
import { absolute, site } from '#lib/site.ts';
import type { Service } from '#lib/data/types.ts';

export const prerender = true;

const link = (title: string, path: string, note: string) =>
  `- [${title}](${absolute(path)}): ${note}`;

function summary(service: Service) {
  const { href, exports } = serviceCard(service);
  const formats = andList(exports.map(({ name }) => name));
  const places = andList(migrationsFrom(service.id).map(({ destination }) => destination.name));
  const note = [
    service.description,
    formats ? `Exports ${formats}.` : 'No way to export.',
    places && `Moves to ${places}.`
  ];
  return link(service.name, href, note.filter(Boolean).join(' '));
}

// A plain summary for AI assistants and answer engines, following https://llmstxt.org
export const GET = () => {
  const counts = [
    `${services().length} services`,
    `${formats().length} file formats`,
    `${migrations().length} ways to move between apps`
  ];
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${andList(counts)}. Each service page has every way to export your data (the steps, the formats, what's in it and what's left out), every way to bring data in, and how to delete your account after. A migration page matches one app's exports to another's imports, and says what makes it across, what gets lost and what nobody's confirmed. Every option links the app's own docs. Data last checked ${lastChecked()}.`,
    '',
    ...categories().flatMap(({ id, name }) => [
      `## ${name}`,
      '',
      ...servicesIn(id).map(summary),
      ''
    ]),
    '## Data',
    '',
    link(
      'Everything as JSON',
      '/api/directory.json',
      'every category, format, service and migration, with the routes between services worked out'
    ),
    link(
      'Schema for a service',
      '/schema/service.json',
      'the shape of a service file, as JSON Schema'
    ),
    link(
      'File formats',
      '/formats',
      'every format, open standard or one app only, and what opens it'
    ),
    link('Migrations', '/migrate', 'every move between two apps there is a route for'),
    '',
    '## Optional',
    '',
    `- [Source and data on GitHub](${site.repo}): MIT licensed, and anyone can add or fix a service`,
    link('Changelog', '/changelog', 'every service added, updated or taken out, also at /feed.xml'),
    ''
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
};
