import { json } from '@sveltejs/kit';
import { buildIndex } from '#lib/search.ts';
import { categories, formats, icon, migrations, services } from '#lib/server/directory.ts';

export const prerender = true;

export const GET = () =>
  json(
    buildIndex(
      { categories: categories(), formats: formats(), services: services() },
      migrations(),
      (id) => icon(id) !== null
    )
  );
