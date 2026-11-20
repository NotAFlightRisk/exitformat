import { categories } from '#lib/server/directory.ts';
import { href } from '#lib/site.ts';

export const prerender = true;

// Cloudflare reads this from the site root, so a bare /notes still finds its category
export const GET = () =>
  new Response(
    categories()
      .flatMap(({ id }) => [`/${id} ${href.category(id)} 301`, `/${id}/ ${href.category(id)} 301`])
      .join('\n') + '\n',
    { headers: { 'Content-Type': 'text/plain' } }
  );
