import { better } from '#lib/data/compat.ts';
import { categories, changelog, formats, migrations, services } from '#lib/server/directory.ts';
import { categoryCard, changeView, migrationCard, serviceCard } from '#lib/server/views.ts';
import { site } from '#lib/site.ts';

const few = 6;

export const load = () => {
  const ranked = migrations().toSorted((a, b) => better(a.paths[0], b.paths[0]));
  return {
    meta: { title: `${site.name} - ${site.tagline.slice(0, -1)}`, description: site.description },
    counts: {
      categories: categories().length,
      services: services().length,
      formats: formats().length,
      migrations: migrations().length
    },
    categories: categories().map(categoryCard),
    featured: ranked.slice(0, few).map(migrationCard),
    // phones get the best move from each category instead
    perCategory: [...Map.groupBy(ranked, ({ source }) => source.category).values()]
      .slice(0, few)
      .map(([best]) => migrationCard(best)),
    recent: services()
      .toSorted((a, b) => b.verification.checked_at.localeCompare(a.verification.checked_at))
      .slice(0, few)
      .map(serviceCard),
    changes: changelog().slice(0, few).map(changeView)
  };
};
