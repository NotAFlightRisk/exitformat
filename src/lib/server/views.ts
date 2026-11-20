import type { Opening } from '#lib/data/compat.ts';
import {
  changeKinds,
  changeSections,
  deployments,
  methods,
  pathKinds,
  platforms,
  statuses,
  type Category,
  type CategoryCard,
  type CategoryLink,
  type ChangeView,
  type Conversion,
  type ConversionView,
  type Crumb,
  type ExportOption,
  type Format,
  type FormatCard,
  type FormatLink,
  type ImportOption,
  type LogEntry,
  type Migration,
  type MigrationCard,
  type OpeningView,
  type OptionView,
  type Path,
  type PathView,
  type Scope,
  type ScopeView,
  type Service,
  type ServiceCard,
  type ServiceLink,
  type ServiceView,
  type Term
} from '#lib/data/types.ts';
import {
  category,
  exporters,
  format,
  icon,
  importers,
  migrationsFrom,
  migrationsTo,
  service,
  servicesIn
} from '#lib/server/directory.ts';
import { commitUrl, editUrl, historyUrl, href, pullUrl } from '#lib/site.ts';

type Labeller = (id: string) => Term;

export const term = <T extends Record<string, string>>(labels: T, id: keyof T & string): Term => ({
  id,
  label: labels[id]
});

export const andList = (items: string[]) =>
  new Intl.ListFormat('en-GB', { type: 'conjunction' }).format(items);

export const crumbs = (...trail: Crumb[]): Crumb[] => [{ name: 'Home', href: '/' }, ...trail];

export const categoryLink = ({ id, name, short }: Category): CategoryLink => ({
  id,
  name,
  short,
  href: href.category(id)
});

export function formatLink(id: string): FormatLink {
  const { name, standard } = format(id)!;
  return { id, name, standard, href: href.format(id) };
}

export const serviceLink = ({ id, name, category: home }: Service): ServiceLink => ({
  id,
  name,
  href: href.service(home, id),
  icon: icon(id),
  category: categoryLink(category(home)!)
});

const formatsOf = (options: { formats: string[] }[]) =>
  [...new Set(options.flatMap((option) => option.formats))].map(formatLink);

export const serviceCard = (found: Service): ServiceCard => ({
  ...serviceLink(found),
  description: found.description,
  deployment: term(deployments, found.deployment),
  platforms: found.platforms.map((id) => term(platforms, id)),
  exports: formatsOf(found.export),
  imports: formatsOf(found.import),
  verification: {
    status: term(statuses, found.verification.status),
    checked: found.verification.checked_at,
    stale: found.verification.stale
  }
});

/** Data type labels, from the first of these categories that knows the id */
const labeller =
  (...homes: string[]): Labeller =>
  (id) => ({ id, label: homes.map((home) => category(home)?.data[id]).find(Boolean) ?? id });

const scopeView = (scope: Partial<Scope> | undefined, label: Labeller): ScopeView | undefined =>
  scope && {
    included: scope.included?.map(label),
    excluded: (scope.excluded ?? []).map(label),
    unknown: (scope.unknown ?? []).map(label)
  };

function optionView(option: ExportOption | ImportOption, label: Labeller): OptionView {
  return {
    id: option.id,
    name: option.name,
    method: term(methods, option.method),
    formats: option.formats.map(formatLink),
    from: 'from' in option ? option.from.map((id) => serviceLink(service(id)!)) : [],
    requirements: option.requirements,
    steps: option.steps,
    data: scopeView(option.data, label),
    limitations: option.limitations,
    docs: option.docs,
    sources: option.sources
  };
}

export function serviceView(found: Service): ServiceView {
  const label = labeller(found.category);
  return {
    ...serviceCard(found),
    website: found.website,
    source: found.source,
    aliases: found.aliases,
    export: found.export.map((option) => optionView(option, label)),
    import: found.import.map((option) => optionView(option, label)),
    delete: found.delete,
    edit: editUrl(found.category, found.id),
    history: historyUrl(found.category, found.id)
  };
}

export const conversionView = (from: string, conversion: Conversion): ConversionView => ({
  ...conversion,
  from: formatLink(from),
  to: formatLink(conversion.to)
});

export function pathView(path: Path, source: Service, destination: Service): PathView {
  const out = labeller(source.category, destination.category);
  const into = labeller(destination.category, source.category);
  return {
    kind: term(pathKinds, path.kind),
    export: path.export && optionView(path.export, out),
    conversion: path.conversion && conversionView(path.conversion.from, path.conversion),
    import: optionView(path.import, into),
    formats: path.formats.map(formatLink),
    carried: path.carried.map(out),
    lost: path.lost.map(out),
    unknown: path.unknown.map(out)
  };
}

export const migrationCard = ({
  source,
  destination,
  paths: [best]
}: Migration): MigrationCard => ({
  href: href.migration(source.id, destination.id),
  source: serviceLink(source),
  destination: serviceLink(destination),
  kind: term(pathKinds, best.kind),
  carried: best.carried.length,
  lost: best.lost.length,
  unknown: best.unknown.length
});

/** Services with the most ways in and out first, until there's traffic to rank them by */
export const busiest = (list: Service[]) => {
  const moves = ({ id }: Service) => migrationsFrom(id).length + migrationsTo(id).length;
  return list.toSorted((a, b) => moves(b) - moves(a));
};

export const openingView = ({ format, conversion, services, more }: Opening): OpeningView => ({
  kind: term(pathKinds, conversion ? 'convert' : 'file'),
  format: formatLink(format),
  conversion: conversion && {
    from: formatLink(conversion.from),
    to: formatLink(conversion.to),
    tool: conversion.tool,
    href: href.conversion(conversion.from, conversion.to)
  },
  services: services.map(serviceLink),
  more
});

export const categoryCard = (found: Category): CategoryCard => ({
  ...categoryLink(found),
  description: found.description,
  services: servicesIn(found.id).length,
  migrations: servicesIn(found.id).reduce((total, { id }) => total + migrationsFrom(id).length, 0),
  examples: busiest(servicesIn(found.id)).slice(0, 4).map(serviceLink)
});

export const formatCard = ({ id, extensions, description }: Format): FormatCard => ({
  ...formatLink(id),
  extensions,
  description,
  exporters: exporters(id).length,
  importers: importers(id).length
});

export function changeView(entry: LogEntry): ChangeView {
  const { date, commit, pr, id, name, kind, sections = [] } = entry;
  const current = service(id);
  return {
    date,
    kind: term(changeKinds, kind),
    sections: sections.map((section) => term(changeSections, section)),
    name,
    service: current ? serviceLink(current) : null,
    source: pr ? { href: pullUrl(pr), label: `#${pr}` } : { href: commitUrl(commit), label: commit }
  };
}
