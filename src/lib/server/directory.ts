import { existsSync, readdirSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { changelogFile, readChangelog } from '#lib/data/changes.ts';
import { check } from '#lib/data/check.ts';
import { migrations as findMigrations } from '#lib/data/compat.ts';
import { loadSources, toDirectory } from '#lib/data/load.ts';
import type { LogEntry, Service } from '#lib/data/types.ts';

export const iconDir = resolve('static/icons');

function index() {
  const sources = loadSources();
  const problem = check(sources).find(({ warning }) => !warning);
  if (problem) {
    const { file, line, path, message } = problem;
    throw new Error(
      `${relative('.', file)}:${line} ${path} ${message}, npm run validate has the lot`
    );
  }

  const directory = toDirectory(sources);
  const { categories, formats, services } = directory;
  const migrations = findMigrations(directory);
  const byId = <T extends { id: string }>(list: T[]) =>
    new Map(list.map((item) => [item.id, item]));
  const users = (list: 'export' | 'import') => {
    const found = new Map<string, Service[]>();
    for (const service of services)
      for (const format of new Set(service[list].flatMap((option) => option.formats)))
        found.set(format, [...(found.get(format) ?? []), service]);
    return found;
  };

  return {
    ...directory,
    migrations,
    category: byId(categories),
    format: byId(formats),
    service: byId(services),
    pair: new Map(migrations.map((found) => [`${found.source.id}/${found.destination.id}`, found])),
    from: Map.groupBy(migrations, ({ source }) => source.id),
    to: Map.groupBy(migrations, ({ destination }) => destination.id),
    members: Map.groupBy(services, (service) => service.category),
    exporters: users('export'),
    importers: users('import'),
    icons: new Set(existsSync(iconDir) ? readdirSync(iconDir) : [])
  };
}

let cached: ReturnType<typeof index> | undefined;
const db = () => (cached ??= index());

let log: LogEntry[] | undefined;
export const changelog = () => (log ??= readChangelog(changelogFile).entries);
export const changesTo = (service: string) => changelog().filter(({ id }) => id === service);

export const categories = () => db().categories;
export const services = () => db().services;
export const formats = () => db().formats;
export const migrations = () => db().migrations;

export const category = (id: string) => db().category.get(id);
export const service = (id: string) => db().service.get(id);
export const format = (id: string) => db().format.get(id);
export const migration = (source: string, destination: string) =>
  db().pair.get(`${source}/${destination}`);

export const servicesIn = (category: string) => db().members.get(category) ?? [];
export const exporters = (format: string) => db().exporters.get(format) ?? [];
export const importers = (format: string) => db().importers.get(format) ?? [];
export const migrationsFrom = (service: string) => db().from.get(service) ?? [];
export const migrationsTo = (service: string) => db().to.get(service) ?? [];

/** The local copy npm run icons saved for a service, if it's managed to get one */
export const icon = (service: string) =>
  db().icons.has(`${service}.png`) ? `/icons/${service}.png` : null;

/** The day the most recently checked of these was checked, or '' if there are none */
export const lastChecked = (list = services()) =>
  list.reduce(
    (latest, { verification }) =>
      verification.checked_at > latest ? verification.checked_at : latest,
    ''
  );
