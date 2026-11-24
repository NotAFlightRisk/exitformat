import type { Format } from '#lib/data/types.ts';
import { categories, exporters, formats, importers, service } from '#lib/server/directory.ts';
import { categoryLink, crumbs, formatCard } from '#lib/server/views.ts';

// an app's own format files under its app's category, and any whose apps read or write it
const homes = ({ id, owner }: Format) =>
  new Set(
    [...exporters(id), ...importers(id), ...(owner ? [service(owner)!] : [])].map(
      ({ category }) => category
    )
  );

export const load = () => {
  const open = formats().filter(({ standard }) => standard);
  const own = formats()
    .filter(({ standard }) => !standard)
    .map((format) => ({ card: formatCard(format), homes: homes(format) }));
  const cards = (where: (homes: Set<string>) => boolean) =>
    own.filter(({ homes }) => where(homes)).map(({ card }) => card);
  return {
    meta: {
      title: 'File formats',
      description: `The ${formats().length} file formats your data comes out in, and what opens them.`
    },
    crumbs: crumbs({ name: 'Formats', href: '/formats' }),
    open: open.map(formatCard),
    own: {
      total: own.length,
      // and one more group, for any no app we list has anything to do with
      groups: [
        ...categories().map((found) => ({
          category: categoryLink(found),
          formats: cards((homes) => homes.has(found.id))
        })),
        { category: null, formats: cards((homes) => !homes.size) }
      ].filter((group) => group.formats.length)
    }
  };
};
