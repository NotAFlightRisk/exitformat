import { error } from '@sveltejs/kit';
import { cards, drawCard } from '#lib/server/og.ts';

export const prerender = true;

export const entries = () => cards().map((card) => ({ card: `${card}.png` }));

export const GET = async ({ params }) => {
  const image = params.card.endsWith('.png') && (await drawCard(params.card.slice(0, -4)));
  if (!image) error(404, 'No card for that page');
  return new Response(image, { headers: { 'Content-Type': 'image/png' } });
};
