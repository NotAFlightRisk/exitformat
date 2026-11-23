import { error } from '@sveltejs/kit';
import {
  category,
  changesTo,
  migrationsFrom,
  migrationsTo,
  openingsFrom,
  openingsTo,
  service,
  services
} from '#lib/server/directory.ts';
import {
  andList,
  changeView,
  crumbs,
  migrationCard,
  openingView,
  serviceView
} from '#lib/server/views.ts';
import { href } from '#lib/site.ts';
import { count } from '#lib/text.ts';

export const entries = () => services().map(({ id, category }) => ({ category, service: id }));

export const load = ({ params }) => {
  const found = service(params.service);
  if (!found || found.category !== params.category) error(404, 'No service by that name');
  const home = category(found.category)!;
  const view = serviceView(found);
  const formats = andList(view.exports.map(({ name }) => name));
  const [out, into] = [openingsFrom(found), openingsTo(found)];
  const takers = out.reach ? `, and the ${count(out.reach, 'app')} that can take your data` : '';

  return {
    meta: {
      title: `Export your data from ${found.name}`,
      description: formats
        ? `${found.name} exports ${formats}. Here's what each export leaves out${takers}.`
        : `There's no official way to get your data out of ${found.name} that we know of.`
    },
    crumbs: crumbs(
      { name: 'Categories', href: '/categories' },
      { name: home.name, href: href.category(home.id) },
      { name: found.name, href: view.href }
    ),
    service: view,
    moveTo: migrationsFrom(found.id).map(migrationCard),
    bringFrom: migrationsTo(found.id).map(migrationCard),
    opensIn: out.rows.map(openingView),
    takesFrom: into.rows.map(openingView),
    reach: { out: out.reach, in: into.reach },
    changes: changesTo(found.id).map(changeView)
  };
};
