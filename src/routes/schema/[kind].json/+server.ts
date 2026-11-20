import { error, json } from '@sveltejs/kit';
import { schemas } from '#lib/data/schema.ts';

export const prerender = true;

export const entries = () => Object.keys(schemas).map((kind) => ({ kind }));

export const GET = ({ params }) => {
  if (!Object.hasOwn(schemas, params.kind)) error(404, 'No schema by that name');
  return json(schemas[params.kind as keyof typeof schemas]);
};
