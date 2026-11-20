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

/** What makes it across: an export's data, less whatever the import drops or doesn't keep */
export function carry(exported: Scope | undefined, imported: Partial<Scope> = {}): Carry {
  const { included: kept, excluded: dropped = [], unknown: unsure = [] } = imported;
  // with no export to go on, the importer's own lists are the whole story
  const offered = exported?.included ?? [...(kept ?? []), ...dropped];
  const carried = unique(
    offered.filter((id) => !dropped.includes(id) && (!kept || kept.includes(id)))
  );
  const lost = unique([
    ...(exported?.excluded ?? []),
    ...offered.filter((id) => !carried.includes(id))
  ]);
  const unknown = unique([...(exported?.unknown ?? []), ...unsure]).filter(
    (id) => !carried.includes(id) && !lost.includes(id)
  );
  return { carried, lost, unknown };
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
      if (!matching.length) add('direct', into, undefined, []);
      for (const out of matching) add('direct', into, out, shared(out.formats, into.formats));
      continue;
    }
    for (const out of source.export) {
      const common = shared(out.formats, into.formats);
      if (common.length) {
        add('file', into, out, common);
        continue;
      }
      for (const from of out.formats)
        for (const conversion of formats.get(from)?.conversions ?? [])
          if (into.formats.includes(conversion.to))
            add('convert', into, out, [conversion.to], { from, ...conversion });
    }
  }
  return found.sort(better);
}

/** Every pair with a way across, as long as they share a category or one's built for the other */
export function migrations({ services, formats }: Directory): Migration[] {
  const byId = new Map(formats.map((format) => [format.id, format]));
  const byFormat = new Map<string, Set<Service>>();
  const bySource = new Map<string, Set<Service>>();
  const file = (map: Map<string, Set<Service>>, key: string, service: Service) =>
    map.set(key, (map.get(key) ?? new Set()).add(service));

  for (const service of services)
    for (const option of service.import)
      if (option.from.length) option.from.forEach((id) => file(bySource, id, service));
      else option.formats.forEach((id) => file(byFormat, id, service));

  return services.flatMap((source) => {
    const reach = source.export.flatMap((option) =>
      option.formats.flatMap((id) => [id, ...(byId.get(id)?.conversions ?? []).map(({ to }) => to)])
    );
    const takers = [bySource.get(source.id), ...reach.map((id) => byFormat.get(id))];
    const candidates = new Set(takers.flatMap((set) => [...(set ?? [])]));
    candidates.delete(source);

    return [...candidates].sort(byName).flatMap((destination) => {
      const same = destination.category === source.category;
      const found = paths(source, destination, byId).filter(
        (path) => same || path.kind === 'direct'
      );
      return found.length ? [{ source, destination, paths: found }] : [];
    });
  });
}
