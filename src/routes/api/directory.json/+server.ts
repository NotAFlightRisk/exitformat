import { json } from '@sveltejs/kit';
import {
  categories,
  formats,
  icon,
  lastChecked,
  migrations,
  services
} from '#lib/server/directory.ts';
import { absolute, href, site } from '#lib/site.ts';

export const prerender = true;

// the lot, with every default filled in and every migration worked out, for anyone to reuse
export const GET = () =>
  json({
    name: site.name,
    url: site.url,
    licence: `MIT, ${site.repo}/blob/main/LICENSE`,
    updated: lastChecked(),
    categories: categories(),
    formats: formats(),
    services: services().map((service) => {
      const local = icon(service.id);
      return {
        ...service,
        url: absolute(href.service(service.category, service.id)),
        icon: local && absolute(local)
      };
    }),
    migrations: migrations().map(({ source, destination, paths }) => ({
      source: source.id,
      destination: destination.id,
      url: absolute(href.migration(source.id, destination.id)),
      // options by id, they're in full on the services above
      paths: paths.map(({ export: out, import: into, ...path }) => ({
        ...path,
        export: out?.id,
        import: into.id
      }))
    }))
  });
