import { error } from '@sveltejs/kit';
import { guided } from '#lib/data/compat.ts';
import { deployments, pathKinds, platforms, type Service } from '#lib/data/types.ts';
import {
  categories,
  category,
  lastChecked,
  pathsBetween,
  servicesIn
} from '#lib/server/directory.ts';
import {
  andList,
  busiest,
  categoryCard,
  categoryLink,
  crumbs,
  formatLink,
  serviceCard,
  serviceLink,
  term
} from '#lib/server/views.ts';
import { href } from '#lib/site.ts';
import { count } from '#lib/text.ts';

const matrixLimit = 40;

const present = (labels: Record<string, string>, ids: string[]) =>
  Object.keys(labels)
    .filter((id) => ids.includes(id))
    .map((id) => ({ id, label: labels[id] }));

function formatsInUse(members: Service[]) {
  const users = (list: 'export' | 'import', id: string) =>
    members.filter((service) => service[list].some(({ formats }) => formats.includes(id))).length;
  const ids = members.flatMap((service) =>
    [...service.export, ...service.import].flatMap(({ formats }) => formats)
  );
  return [...new Set(ids)]
    .map((id) => ({
      ...formatLink(id),
      exporters: users('export', id),
      importers: users('import', id)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** A guide when there is one, otherwise the format page that explains the way across */
function cell(source: Service, destination: Service) {
  const found = source === destination ? [] : pathsBetween(source, destination);
  if (!found.length) return null;
  const [{ kind, formats, conversion }] = found;
  if (guided(found))
    return { href: href.migration(source.id, destination.id), kind: term(pathKinds, kind) };
  const via = formatLink(conversion?.from ?? formats[0]);
  return {
    href: conversion ? href.conversion(conversion.from, conversion.to) : via.href,
    kind: term(pathKinds, kind),
    via: via.name
  };
}

const matrixOf = (members: Service[]) => ({
  services: members.map(serviceLink),
  rows: members.map((source) => members.map((destination) => cell(source, destination)))
});

export const entries = () => categories().map(({ id }) => ({ category: id }));

export const load = ({ params }) => {
  const found = category(params.category);
  if (!found) error(404, 'No category by that name');
  const members = servicesIn(found.id);
  const cards = members.map(serviceCard);
  // the busiest few by name, as the whole list runs past what a search result shows
  const named = busiest(members)
    .slice(0, 3)
    .map(({ name }) => name);
  const rest = members.length - named.length;
  const names = andList(rest ? [...named, count(rest, 'other')] : named);

  return {
    meta: {
      title: `${found.name}: get your data out and move it`,
      description: `${found.description} How to export from ${names}, and which of them can move to each other.`,
      modified: lastChecked(members)
    },
    crumbs: crumbs(
      { name: 'Categories', href: '/categories' },
      { name: found.name, href: href.category(found.id) }
    ),
    category: {
      ...categoryLink(found),
      description: found.description,
      data: Object.entries(found.data).map(([id, label]) => ({ id, label }))
    },
    guides: categoryCard(found).migrations,
    services: cards,
    filters: {
      platforms: present(
        platforms,
        cards.flatMap((card) => card.platforms.map(({ id }) => id))
      ),
      deployments: present(
        deployments,
        cards.map((card) => card.deployment.id)
      )
    },
    formats: formatsInUse(members),
    matrix: members.length > matrixLimit ? null : matrixOf(members)
  };
};
