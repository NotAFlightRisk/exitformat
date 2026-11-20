import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { isMap, isSeq, LineCounter, parseDocument, type Node } from 'yaml';
import {
  sharedData,
  staleAfterDays,
  type Category,
  type Conversion,
  type Directory,
  type ExportOption,
  type Format,
  type ImportOption,
  type Scope,
  type Service
} from '#lib/data/types.ts';

export const dataDir = resolve('data');

export interface Source {
  kind: 'category' | 'format' | 'service';
  id: string;
  category: string;
  file: string;
  raw: unknown;
  errors: { line: number; message: string }[];
  lineOf: (path: (string | number)[]) => number;
}

const day = 24 * 60 * 60 * 1000;
export const isStale = (checked: string, today: Date) =>
  today.getTime() - Date.parse(checked) > staleAfterDays * day;

export function readSource(file: string, kind: Source['kind'], category = ''): Source {
  const lines = new LineCounter();
  const doc = parseDocument(readFileSync(file, 'utf8'), { lineCounter: lines });

  const lineOf = (path: (string | number)[]) => {
    let node: unknown = doc.contents;
    let offset = 0;
    for (const step of path) {
      const next = isMap(node)
        ? node.items.find(({ key }) => (key as { value?: unknown })?.value === step)
        : isSeq(node) && typeof step === 'number'
          ? { key: node.items[step], value: node.items[step] }
          : undefined;
      if (!next) break;
      offset = (next.key as Node | undefined)?.range?.[0] ?? offset;
      node = next.value;
    }
    return lines.linePos(offset).line;
  };

  return {
    kind,
    id: basename(file).replace(/\.ya?ml$/, ''),
    category,
    file,
    raw: doc.errors.length ? undefined : doc.toJS(),
    errors: doc.errors.map(({ linePos, message }) => ({
      line: linePos?.[0].line ?? 1,
      message: message.split('\n')[0].replace(/ at line \d+, column \d+:$/, '')
    })),
    lineOf
  };
}

const yamlIn = (dir: string, recursive = false) =>
  existsSync(dir)
    ? readdirSync(dir, { recursive, encoding: 'utf8' })
        .filter((name) => /\.ya?ml$/.test(name))
        .sort()
    : [];

export function loadSources(dir = dataDir): Source[] {
  const flat = (kind: Source['kind'], folder: string) =>
    yamlIn(join(dir, folder)).map((name) => readSource(join(dir, folder, name), kind));
  const services = yamlIn(join(dir, 'services'), true).map((name) =>
    readSource(join(dir, 'services', name), 'service', dirname(name))
  );
  return [...flat('category', 'categories'), ...flat('format', 'formats'), ...services];
}

/** Validated YAML, with the lists it's allowed to leave out filled in */
const fill = <T>(defaults: object, raw: unknown) => ({ ...defaults, ...(raw as object) }) as T;

const lists = { formats: [], requirements: [], limitations: [], sources: [] };

function exported(raw: unknown): ExportOption {
  const option = fill<ExportOption>(lists, raw);
  return { ...option, data: fill<Scope>({ excluded: [], unknown: [] }, option.data) };
}

const imported = (raw: unknown) => fill<ImportOption>({ ...lists, from: [] }, raw);

function category({ id, raw }: Source): Category {
  const given = raw as Omit<Category, 'id'>;
  return { id, ...given, data: { ...given.data, ...sharedData } };
}

function format({ id, raw }: Source): Format {
  const given = fill<Omit<Format, 'id'>>({ extensions: [], conversions: [] }, raw);
  const conversions = given.conversions.map((conversion) =>
    fill<Conversion>({ limitations: [] }, conversion)
  );
  return { id, ...given, conversions };
}

const service =
  (today: Date) =>
  ({ id, category, raw }: Source): Service => {
    const given = fill<Omit<Service, 'id' | 'category'>>({ aliases: [] }, raw);
    return {
      id,
      category,
      ...given,
      export: given.export.map(exported),
      import: given.import.map(imported),
      delete: given.delete && fill({ notes: [] }, given.delete),
      verification: {
        ...given.verification,
        stale: isStale(given.verification.checked_at, today)
      }
    };
  };

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name);

/** Turns sources that have passed the validator into the typed directory */
export function toDirectory(sources: Source[], today = new Date()): Directory {
  const of = <T extends { name: string }>(kind: Source['kind'], build: (source: Source) => T) =>
    sources
      .filter((source) => source.kind === kind)
      .map(build)
      .sort(byName);
  return {
    categories: of('category', category),
    formats: of('format', format),
    services: of('service', service(today))
  };
}
