import { error, json } from '@sveltejs/kit';
import { serviceJson } from '#lib/data/api.ts';
import {
  format,
  icon,
  lastChecked,
  migrationsFrom,
  migrationsTo,
  service,
  services
} from '#lib/server/directory.ts';

export const prerender = true;

export const entries = () => services().map(({ id, category }) => ({ category, service: id }));

export const GET = ({ params }) => {
  const found = service(params.service);
  if (!found || found.category !== params.category) error(404, 'No service by that name');
  const guides = { out: migrationsFrom(found.id), in: migrationsTo(found.id) };
  return json(serviceJson(found, format, guides, lastChecked(), icon));
};
