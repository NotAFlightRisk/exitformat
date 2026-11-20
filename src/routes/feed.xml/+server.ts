import type { ChangeView } from '#lib/data/types.ts';
import { changelog, lastChecked } from '#lib/server/directory.ts';
import { andList, changeView } from '#lib/server/views.ts';
import { absolute, site } from '#lib/site.ts';

export const prerender = true;

const limit = 50;
const escape = (text: string) => text.replace(/[&<>"]/g, (char) => `&#${char.charCodeAt(0)};`);

function title({ kind, sections, name }: ChangeView) {
  if (kind.id === 'added') return `${name} added`;
  if (kind.id === 'removed') return `${name} taken out`;
  return `${name}: ${andList(sections.map(({ label }) => label.toLowerCase()))} updated`;
}

export const GET = () => {
  const entries = changelog().slice(0, limit);
  const items = entries.map((entry) => {
    const change = changeView(entry);
    const page = change.service ? change.service.href : '/changelog';
    const content = `<p>${escape(title(change))}.</p><p><a href="${change.source.href}">${
      entry.pr ? `Pull request ${change.source.label}` : `Commit ${change.source.label}`
    }</a></p>`;
    return [
      '<entry>',
      `<title>${escape(title(change))}</title>`,
      `<link href="${absolute(page)}"/>`,
      `<id>tag:${new URL(site.url).host},${entry.date}:${entry.commit}-${entry.id}</id>`,
      `<updated>${entry.date}T00:00:00Z</updated>`,
      `<content type="html">${escape(content)}</content>`,
      '</entry>'
    ].join('');
  });
  const feed = [
    '<?xml version="1.0" encoding="utf-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `<title>${site.name} changelog</title>`,
    '<subtitle>Every service added, updated or taken out, newest first</subtitle>',
    `<link href="${absolute('/feed.xml')}" rel="self"/>`,
    `<link href="${absolute('/changelog')}"/>`,
    `<id>${absolute('/changelog')}</id>`,
    `<updated>${entries[0]?.date ?? lastChecked()}T00:00:00Z</updated>`,
    `<author><name>${site.name}</name><uri>${site.url}</uri></author>`,
    ...items,
    '</feed>'
  ];
  return new Response(feed.join('\n'), {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' }
  });
};
