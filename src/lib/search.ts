import {
  pathKinds,
  type Directory,
  type Migration,
  type PathKind,
  type Term
} from '#lib/data/types.ts';
import { href } from '#lib/site.ts';

// a way out: the destination's place in the list, the best route and its carry counts
type Way = [to: number, kind: PathKind, carried: number, lost: number, unknown: number];

/** What /api/search.json holds. Services point at formats and each other by place in the list */
export interface SearchIndex {
  categories: { id: string; name: string; short?: string }[];
  formats: { id: string; name: string; extensions: string[] }[];
  services: {
    id: string;
    name: string;
    category: string;
    aliases: string[];
    exports: number[];
    imports: number[];
    to: Way[];
    icon: boolean;
  }[];
}

export interface SearchResult {
  kind: 'migration' | 'service' | 'category' | 'format';
  name: string;
  href: string;
  detail: string;
  icon: string | null;
  /** a migration's two ends, its best route and that route's carry counts */
  route?: {
    source: End;
    destination: End;
    kind: Term;
    carried: number;
    lost: number;
    unknown: number;
  };
}

interface End {
  name: string;
  icon: string | null;
}

type Entry = SearchIndex['services'][number];

export function buildIndex(
  { categories, formats, services }: Directory,
  migrations: Migration[],
  hasIcon: (service: string) => boolean
): SearchIndex {
  const placeOf = (list: { id: string }[]) => new Map(list.map(({ id }, at) => [id, at]));
  const [format, service] = [placeOf(formats), placeOf(services)];
  const formatsOf = (options: { formats: string[] }[]) =>
    [...new Set(options.flatMap((option) => option.formats))].map((id) => format.get(id)!);
  const moves = Map.groupBy(migrations, ({ source }) => source.id);

  return {
    categories: categories.map(({ id, name, short }) => ({ id, name, short })),
    formats: formats.map(({ id, name, extensions }) => ({ id, name, extensions })),
    services: services.map(({ id, name, category, aliases, ...found }) => ({
      id,
      name,
      category,
      aliases,
      exports: formatsOf(found.export),
      imports: formatsOf(found.import),
      to: (moves.get(id) ?? []).map(({ destination, paths: [best] }): Way => [
        service.get(destination.id)!,
        best.kind,
        best.carried.length,
        best.lost.length,
        best.unknown.length
      ]),
      icon: hasIcon(id)
    }))
  };
}

interface Key {
  text: string;
  joined: string;
  weight: number;
}

// ".jex", "JEX" and "Jéx" all come out as "jex"
const fold = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

const keyOf =
  (weight: number) =>
  (text: string): Key => {
    const folded = fold(text);
    return { text: folded, joined: folded.replaceAll(' ', ''), weight };
  };

// what people type round the name of the thing they're after
const filler = new Set(
  `a an and account can data delete deleting do export exporting exports file files for format
  formats from get how i import importing imports in into migrate migrating migration move moving
  my of or out switch switching the to transfer with your`.split(/\s+/)
);

function readings(query: string) {
  const whole = keyOf(1)(query);
  const meant = keyOf(0.95)(
    whole.text
      .split(' ')
      .filter((word) => !filler.has(word))
      .join(' ')
  );
  return [whole, ...(meant.text && meant.text !== whole.text ? [meant] : [])];
}

// one slip in a word, or two in a long one, by optimal string alignment
function near(typed: string, word: string) {
  const limit = typed.length > 7 ? 2 : 1;
  if (typed.length < 4 || Math.abs(typed.length - word.length) > limit) return false;
  let before: number[] = [];
  let previous = Array.from({ length: word.length + 1 }, (_, at) => at);
  for (let i = 1; i <= typed.length; i++) {
    const row = [i];
    for (let j = 1; j <= word.length; j++) {
      const swap =
        typed[i - 1] === word[j - 2] && typed[i - 2] === word[j - 1] ? before[j - 2] + 1 : Infinity;
      const change = previous[j - 1] + Number(typed[i - 1] !== word[j - 1]);
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, change, swap);
    }
    [before, previous] = [previous, row];
  }
  return previous[word.length] <= limit;
}

function fit(query: string, text: string) {
  if (!query) return 0;
  if (text === query) return 1;
  if (text.startsWith(query)) return 0.9;
  if (` ${text} `.includes(` ${query} `)) return 0.8;
  if (` ${text}`.includes(` ${query}`)) return 0.75;
  const words = text.split(' ');
  const tokens = query.split(' ');
  if (tokens.every((token) => words.some((word) => word.startsWith(token)))) return 0.6;
  if (query.length > 2 && text.includes(query)) return 0.5;
  const close = (token: string) =>
    words.some((word) => word.startsWith(token) || near(token, word));
  return tokens.every(close) ? 0.4 : 0;
}

// the joined-up try is so "notionso" and "2 fas" still find notion.so and 2FAS
const score = (queries: Key[], keys: Key[]) =>
  Math.max(
    0,
    ...queries.flatMap((query) =>
      keys.map(
        (key) =>
          query.weight *
          key.weight *
          Math.max(fit(query.text, key.text), 0.9 * fit(query.joined, key.joined))
      )
    )
  );

function prepare({ categories, formats, services }: SearchIndex) {
  const named = (name: string, others: string[], weights: [number, number]) => [
    keyOf(weights[0])(name),
    ...others.map(keyOf(weights[1]))
  ];
  const sizes = new Map<string, number>();
  for (const { category } of services) sizes.set(category, (sizes.get(category) ?? 0) + 1);
  return {
    categories: categories.map(({ name, short }) => named(name, short ? [short] : [], [1, 1])),
    // a format only beats a service when it fits better, never on a tie
    formats: formats.map(({ name, extensions }) => named(name, extensions, [0.9, 0.85])),
    services: services.map(({ name, aliases }) => named(name, aliases, [1, 0.9])),
    homes: new Map(categories.map((category) => [category.id, category])),
    sizes
  };
}

type Prepared = ReturnType<typeof prepare>;
const prepared = new WeakMap<SearchIndex, Prepared>();
const order: SearchResult['kind'][] = ['migration', 'service', 'category', 'format'];
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

// "notion to obsidian", "from notion to obsidian", "move notion -> obsidian"
const lead = /^\s*(?:(?:move|migrate|switch|transfer|go)\s+)?(?:from\s+)?/i;
const between = /\s*(?:->|→|=>|>)\s*|\s+(?:to|into)\s+/gi;

/** The best-fitting services either side of "X to Y", however the query splits that way */
function ends(index: SearchIndex, keys: Prepared, query: string) {
  // an end that a crowd fits equally well is still being typed
  const crowd = 10;
  const candidates = (text: string) => {
    const end = readings(text);
    const fits = keys.services.map((list) => score(end, list));
    const top = Math.max(...fits);
    const best = top ? index.services.filter((_, at) => fits[at] === top) : [];
    return best.length > crowd ? [] : best;
  };
  const asked = query.replace(lead, '');
  return [...asked.matchAll(between)].flatMap((split) => {
    const destinations = candidates(asked.slice(split.index + split[0].length));
    return candidates(asked.slice(0, split.index)).flatMap((source) =>
      destinations.map((destination) => [source, destination] as const)
    );
  });
}

/** Every match for a query, best first, ready to show and link */
export function search(index: SearchIndex, query: string): SearchResult[] {
  const typed = readings(query);
  if (!typed[0].text) return [];
  if (!prepared.has(index)) prepared.set(index, prepare(index));
  const keys = prepared.get(index)!;
  // a leading dot means a file extension, so only formats and who uses them
  const named = !query.trim().startsWith('.');

  const found = new Map<string, SearchResult & { score: number }>();
  const add = (score: number, result: SearchResult) => {
    if (score > (found.get(result.href)?.score ?? 0)) found.set(result.href, { ...result, score });
  };
  const iconOf = (service: Entry) => (service.icon ? `/icons/${service.id}.png` : null);
  const serviceResult = (service: Entry, detail?: string): SearchResult => {
    const home = keys.homes.get(service.category);
    return {
      kind: 'service',
      name: service.name,
      href: href.service(service.category, service.id),
      detail: detail ?? home?.short ?? home?.name ?? '',
      icon: iconOf(service)
    };
  };

  const formatFit = keys.formats.map((list) => score(typed, list));
  index.formats.forEach(({ id, name, extensions }, at) =>
    add(formatFit[at], {
      kind: 'format',
      name,
      href: href.format(id),
      detail: extensions.join(', '),
      icon: null
    })
  );

  // a service that reads or writes a format sits under the format itself
  const viaFormat = (service: Entry, list: number[], weight: number, verb: string) => {
    const best = list.reduce((top, at) => (formatFit[at] > formatFit[top] ? at : top), list[0]);
    if (formatFit[best] >= 0.6)
      add(weight * formatFit[best], serviceResult(service, `${verb} ${index.formats[best].name}`));
  };
  index.services.forEach((service, at) => {
    if (named) add(score(typed, keys.services[at]), serviceResult(service));
    viaFormat(service, service.exports, 0.5, 'Exports');
    viaFormat(service, service.imports, 0.45, 'Imports');
  });

  if (named)
    index.categories.forEach(({ id, name }, at) =>
      add(score(typed, keys.categories[at]), {
        kind: 'category',
        name,
        href: href.category(id),
        detail: plural(keys.sizes.get(id) ?? 0, 'service'),
        icon: null
      })
    );

  const end = (service: Entry): End => ({ name: service.name, icon: iconOf(service) });
  for (const [source, destination] of named ? ends(index, keys, query) : []) {
    add(1, serviceResult(source));
    add(1, serviceResult(destination));
    const way = source.to.find(([to]) => to === index.services.indexOf(destination));
    if (!way) continue;
    const [, kind, carried, lost, unknown] = way;
    add(2, {
      kind: 'migration',
      name: `${source.name} to ${destination.name}`,
      href: href.migration(source.id, destination.id),
      detail: '',
      icon: iconOf(source),
      route: {
        source: end(source),
        destination: end(destination),
        kind: { id: kind, label: pathKinds[kind] },
        carried,
        lost,
        unknown
      }
    });
  }

  return [...found.values()]
    .sort(
      (a, b) =>
        b.score - a.score ||
        order.indexOf(a.kind) - order.indexOf(b.kind) ||
        a.name.localeCompare(b.name)
    )
    .map(({ score, ...result }) => result);
}
