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
import { absolute, href, site } from '#lib/site.ts';
import type { Service } from '#lib/data/types.ts';

export const prerender = true;

const link = (title: string, path: string, note: string) =>
  `- [${title}](${absolute(path)}): ${note}`;

function summary(service: Service) {
  const { href: page, exports } = serviceCard(service);
  const formats = andList(exports.map(({ name }) => name));
  // each guide linked, so a question about one move can go straight to it
  const places = andList(
    migrationsFrom(service.id).map(
      ({ destination }) =>
        `[${destination.name}](${absolute(href.migration(service.id, destination.id))})`
    )
  );
  const note = [
    service.description,
    formats ? `Exports ${formats}.` : 'No way to export.',
    places && `Step-by-step guides to ${places}.`
  ];
  return link(service.name, page, note.filter(Boolean).join(' '));
}

// A plain summary for AI assistants and answer engines, following https://llmstxt.org
export const GET = () => {
  const counts = [
    `${services().length} services`,
    `${formats().length} file formats`,
    `${migrations().length} step-by-step guides to moving between apps`
  ];
  const [example] = services();
  const lines = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `${andList(counts)}. Each service page has every way to export your data (the steps, the formats, what's in it and what's left out), every way to bring data in, where it can go and how to delete your account after. A move gets its own guide when the app you're going to has an importer made for the one you're leaving, and the guide says what makes it across, what gets lost and what nobody's confirmed. Apps that only share a file format, like Markdown or CSV, are listed by format on each service page, and each format's page lists everything that reads and writes it. Every option links the app's own docs. Data last checked ${lastChecked()}.`,
    '',
    ...categories().flatMap(({ id, name }) => [
      `## ${name}`,
      '',
      link(
        `${name} compared`,
        href.category(id),
        "which of these apps can read each other's exports, and in what format"
      ),
      ...servicesIn(id).map(summary),
      ''
    ]),
    '## Browse',
    '',
    link('Categories', '/categories', 'every category, with how many apps and move guides it has'),
    link(
      'Apps',
      '/apps',
      'every app from A to Z, with how many formats it exports and how many apps it can move to'
    ),
    link(
      'File formats',
      '/formats',
      'every format, open standard or one app only, and what opens it'
    ),
    link('Move guides', '/migrate', 'every move with a step-by-step guide'),
    '',
    '## Data',
    '',
    link(
      'Everything as JSON',
      '/api/directory.json',
      'every category, format and service, with the defaults filled in'
    ),
    link(
      'Guided moves as JSON',
      '/api/routes.json',
      'every move with a guide, as source, destination and how much carries over, lost or not sure'
    ),
    link(
      'One service as JSON',
      `/api/services/${example.category}/${example.id}.json`,
      "a service's entry, the formats it reads and writes and its guided moves, at /api/services/<category>/<id>.json"
    ),
    link(
      'Schema for a service',
      '/schema/service.json',
      'the shape of a service file, as JSON Schema'
    ),
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
