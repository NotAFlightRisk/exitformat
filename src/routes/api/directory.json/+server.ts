import { json } from '@sveltejs/kit';
import { directoryJson } from '#lib/data/api.ts';
import { categories, formats, icon, lastChecked, services } from '#lib/server/directory.ts';

export const prerender = true;

export const GET = () =>
  json(
    directoryJson(
      { categories: categories(), formats: formats(), services: services() },
      lastChecked(),
      icon
    )
  );
