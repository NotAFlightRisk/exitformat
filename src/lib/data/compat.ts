import type {
  Carry,
  Directory,
  ExportOption,
  Format,
  ImportOption,
  Migration,
  Path,
  PathKind,
  Scope,
  Service
} from '#lib/data/types.ts';

const rank: Record<PathKind, number> = { direct: 0, file: 1, convert: 2 };
const unique = (ids: string[]) => [...new Set(ids)];
const shared = (a: string[], b: string[]) => a.filter((id) => b.includes(id));
const byName = (a: Service, b: Service) => a.name.localeCompare(b.name);

/** Sorts paths best first: direct, then file, then convert, then by how much makes it across */
export const better = (a: Path, b: Path) =>
  rank[a.kind] - rank[b.kind] || b.carried.length - a.carried.length;

/** What happens to each thing in an export: carried, lost, or nobody's sure */
export function carry(exported: Scope | undefined, imported: Partial<Scope> = {}): Carry {
  const { included: kept, excluded: dropped = [], unknown: unsure = [] } = imported;
  // with no export to go on, the importer's own lists are the whole story
  const { included, excluded, unknown } = exported ?? {
    included: [...(kept ?? []), ...dropped, ...unsure],
    excluded: [],
    unknown: []
  };
  const fate = (id: string): keyof Carry => {
    if (excluded.includes(id) || dropped.includes(id)) return 'lost';
    if (kept?.includes(id) && !unknown.includes(id)) return 'carried';
    if (unknown.includes(id) || unsure.includes(id)) return 'unknown';
    return kept ? 'lost' : 'carried';
  };
  const sorted: Carry = { carried: [], lost: [], unknown: [] };
  for (const id of unique([...excluded, ...included, ...unknown])) sorted[fate(id)].push(id);
  return sorted;
}

/** Every way from one service's exports into another's imports, best first */
export function paths(source: Service, destination: Service, formats: Map<string, Format>) {
  const found: Path[] = [];
  const add = (
    kind: PathKind,
    into: ImportOption,
    out: ExportOption | undefined,
    via: string[],
    conversion?: Path['conversion']
  ) =>
    found.push({
      kind,
      export: out,
      conversion,
      import: into,
      formats: via,
      ...carry(out?.data, into.data)
    });

  for (const into of destination.import) {
    if (into.from.length) {
      if (!into.from.includes(source.id)) continue;
      const matching = source.export.filter((out) => shared(out.formats, into.formats).length);
      if (!matching.length && into.method === 'connect') add('direct', into, undefined, []);
      for (const out of matching) add('direct', into, out, shared(out.formats, into.formats));
      continue;
    }
    for (const out of source.export) {
      const common = shared(out.formats, into.formats);
      if (common.length) {
        // an importer that reads the source's own format was made for the source
        const made = common.some((id) => formats.get(id)!.owner === source.id);
        add(made ? 'direct' : 'file', into, out, common);
        continue;
      }
      for (const from of out.formats)
        for (const conversion of formats.get(from)?.conversions ?? [])
          if (into.formats.includes(conversion.to))
            add('convert', into, out, [conversion.to], { from, ...conversion });
    }
  }
  // a conversion fills a gap, it doesn't pad out a pair that already has a real way across
  const straight = found.filter((path) => path.kind !== 'convert');
  return (straight.length ? straight : found).sort(better);
}

/** A pair gets its own guide only when the destination has an importer made for the source */
export const guided = (found: Path[]) => found.some(({ kind }) => kind === 'direct');

const generic = (option: ExportOption | ImportOption) => !('from' in option) || !option.from.length;

function collect<T>(map: Map<string, T[]>, key: string, item: T) {
  const list = map.get(key);
  if (list) list.push(item);
  else map.set(key, [item]);
}

/** Every pair with a guide, and every way across for each */
export function migrations({ services, formats }: Directory): Migration[] {
  const byId = new Map(formats.map((format) => [format.id, format]));
  const bySource = new Map<string, Service[]>();
  const byFormat = new Map<string, Service[]>();

  for (const service of services)
    for (const option of service.import)
      if (option.from.length) option.from.forEach((id) => collect(bySource, id, service));
      else
        unique(option.formats)
          .filter((id) => byId.get(id)!.owner)
          .forEach((id) => collect(byFormat, id, service));

  return services.flatMap((source) => {
    const made = unique(source.export.flatMap((option) => option.formats)).filter(
      (id) => byId.get(id)!.owner === source.id
    );
    const takers = [bySource.get(source.id), ...made.map((id) => byFormat.get(id))];
    const candidates = new Set(takers.flatMap((list) => list ?? []));
    candidates.delete(source);

    return [...candidates].sort(byName).flatMap((destination) => {
      const same = destination.category === source.category;
      // between categories a shared format is a coincidence, not a route
      const found = paths(source, destination, byId).filter(
        (path) => same || path.kind === 'direct'
      );
      return guided(found) ? [{ source, destination, paths: found }] : [];
    });
  });
}

// a handful of apps a format row, the format page lists the rest
const few = 4;

/** Apps in the same category that share a format with a service but have no guide */
export interface Opening {
  /** what the listed apps read (going out) or write (coming in) */
  format: string;
  conversion?: Path['conversion'];
  /** the first few, most guides first */
  services: Service[];
  more: number;
}

/** Where a service's files can go, or come from, without a guide, and how many apps it reaches */
export function openings({ services, formats }: Directory, guides: Migration[]) {
  const guidedOut = Map.groupBy(guides, ({ source }) => source);
  const guidedIn = Map.groupBy(guides, ({ destination }) => destination);
  const busy = (service: Service) =>
    (guidedOut.get(service)?.length ?? 0) + (guidedIn.get(service)?.length ?? 0);
  // apps with the most guides first, until there's traffic to rank them by
  const ranked = services.toSorted((a, b) => busy(b) - busy(a));
  const users = (side: 'export' | 'import') => {
    const found = new Map<string, Service[]>();
    for (const service of ranked)
      for (const id of unique(service[side].filter(generic).flatMap(({ formats }) => formats)))
        collect(found, `${service.category}/${id}`, service);
    return found;
  };
  const [writers, readers] = [users('export'), users('import')];
  const conversions = formats.flatMap(({ id: from, conversions }) =>
    conversions.map((conversion) => ({ from, ...conversion }))
  );

  return (service: Service, side: 'out' | 'in') => {
    const out = side === 'out';
    const mine = unique(
      service[out ? 'export' : 'import'].filter(generic).flatMap(({ formats }) => formats)
    );
    const known = (out ? guidedOut : guidedIn).get(service) ?? [];
    const skip = new Set([
      service,
      ...known.map((guide) => (out ? guide.destination : guide.source))
    ]);
    const rows: Opening[] = [];
    const list = (format: string, conversion?: Path['conversion']) => {
      const found = ((out ? readers : writers).get(`${service.category}/${format}`) ?? []).filter(
        (other) => !skip.has(other)
      );
      if (found.length)
        rows.push({
          format,
          conversion,
          services: found.slice(0, few),
          more: Math.max(0, found.length - few)
        });
      return found;
    };

    // an app goes under every format it shares, but only one conversion, and only for a gap
    mine.flatMap((format) => list(format)).forEach((other) => skip.add(other));
    for (const conversion of conversions)
      if (mine.includes(out ? conversion.from : conversion.to))
        list(out ? conversion.to : conversion.from, conversion).forEach((other) => skip.add(other));
    return { rows, reach: skip.size - 1 };
  };
}
