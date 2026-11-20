import { json } from '@sveltejs/kit';
import { routesJson } from '#lib/data/api.ts';
import { lastChecked, migrations } from '#lib/server/directory.ts';

export const prerender = true;

export const GET = () => json(routesJson(migrations(), lastChecked()));
