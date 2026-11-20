import type { Directory, Format, Migration, Service } from '#lib/data/types.ts';
import { absolute, href, site } from '#lib/site.ts';

type Icon = (service: string) => string | null;

const about = (updated: string) => ({
  name: site.name,
  url: site.url,
  licence: `MIT, ${site.repo}/blob/main/LICENSE`,
  updated
});

const entry = (service: Service, icon: Icon) => {
  const local = icon(service.id);
  return {
    ...service,
    url: absolute(href.service(service.category, service.id)),
    icon: local && absolute(local)
  };
};

/** A guided move in one line, with its guide's address */
export const route = ({ source, destination, paths: [best] }: Migration) => ({
  source: source.id,
  destination: destination.id,
  url: absolute(href.migration(source.id, destination.id)),
  carried: best.carried.length,
  lost: best.lost.length,
  unknown: best.unknown.length
});

/** /api/directory.json: the data itself, one entry a thing, nothing worked out pair by pair */
export const directoryJson = (
  { categories, formats, services }: Directory,
  updated: string,
  icon: Icon
) => ({
  ...about(updated),
  categories,
  formats,
  services: services.map((service) => entry(service, icon))
});

/** /api/routes.json: every move with a guide */
export const routesJson = (guides: Migration[], updated: string) => ({
  ...about(updated),
  routes: guides.map(route)
});

/** /api/services/<category>/<id>.json: one service, its formats and its guided moves */
export function serviceJson(
  service: Service,
  format: (id: string) => Format | undefined,
  guides: { out: Migration[]; in: Migration[] },
  updated: string,
  icon: Icon
) {
  const used = (options: { formats: string[] }[]) =>
    [...new Set(options.flatMap((option) => option.formats))].map((id) => {
      const { name, standard } = format(id)!;
      return { id, name, standard };
    });
  return {
    ...about(updated),
    service: entry(service, icon),
    exports: used(service.export),
    imports: used(service.import),
    routes_out: guides.out.map(route),
    routes_in: guides.in.map(route)
  };
}
