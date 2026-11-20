import { relative } from 'node:path';
import { check } from '#lib/data/check.ts';
import { migrations as findMigrations } from '#lib/data/compat.ts';
import { loadSources, toDirectory } from '#lib/data/load.ts';
import type { Service } from '#lib/data/types.ts';

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
    importers: users('import')
  };
}

let cached: ReturnType<typeof index> | undefined;
const db = () => (cached ??= index());

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

export const dataLabel = (category: string, id: string) =>
  db().category.get(category)?.data[id] ?? id;
export const formatName = (id: string) => db().format.get(id)?.name ?? id;
