import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import satori from 'satori';
import {
  pathKinds,
  type Category,
  type Format,
  type Migration,
  type Service
} from '#lib/data/types.ts';
import {
  categories,
  category,
  exporters,
  format,
  formats,
  icon,
  iconDir,
  importers,
  migration,
  migrations,
  migrationsFrom,
  service,
  services,
  servicesIn
} from '#lib/server/directory.ts';
import { busiest, formatLink } from '#lib/server/views.ts';
import { ogSize, site } from '#lib/site.ts';
import { count, formatDate, initials, symbol } from '#lib/text.ts';

// Share cards drawn at build time: satori lays the divs out as SVG, resvg makes the PNG

// the light theme from app.css, since satori can't read CSS variables
const colour = {
  ground: '#f4f4f0',
  cell: '#fdfdfb',
  ink: '#1c1d1f',
  muted: '#56585b',
  rule: '#d0d0c9',
  accent: '#237f52'
};

// the site's 1px hairline, doubled so it survives being shrunk into a feed
const hairline = 2;

type Child = Node | string | false | null | undefined;
interface Node {
  type: string;
  props: Record<string, unknown>;
}

const div = (style: object, ...children: Child[]): Node => ({
  type: 'div',
  props: { style: { display: 'flex', ...style }, children: children.filter(Boolean) }
});

const img = (src: string, size: number): Node => ({
  type: 'img',
  props: { src, width: size, height: size }
});

const dataUri = (type: string, data: string | Buffer) =>
  `data:${type};base64,${Buffer.from(data).toString('base64')}`;

const logo = dataUri('image/svg+xml', readFileSync(resolve('static/favicon.svg')));

const iconOf = (id: string) =>
  icon(id) && dataUri('image/png', readFileSync(resolve(iconDir, `${id}.png`)));

// Icon.svelte's paths, on the same 16px grid
const svg = (body: string) =>
  dataUri(
    'image/svg+xml',
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">${body}</svg>`
  );
const stroke = (path: string, ink: string) =>
  `<path d="${path}" fill="none" stroke="${ink}" stroke-width="1.75" stroke-linecap="square"/>`;
const box = (dash = '') =>
  `<rect x=".75" y=".75" width="14.5" height="14.5" fill="none" stroke="${colour.ink}" stroke-width="1.5" ${dash}/>`;

const arrow = svg(stroke('M2.5 8h10.5M9 4l4 4-4 4', colour.muted));
const marks = {
  carried: svg(
    `<rect width="16" height="16" fill="${colour.ink}"/>${stroke('M3.5 8.25 6.5 11.25 12.5 4.75', colour.cell)}`
  ),
  lost: svg(box() + stroke('M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5', colour.ink)),
  unsure: svg(
    box('stroke-dasharray="2.5 1.5"') +
      stroke('M5.75 6.25a2.25 2.25 0 1 1 3.2 2.05c-.6.3-.95.75-.95 1.4v.3M8 11.75v.75', colour.ink)
  )
};

// a border as padding on a coloured box, since resvg is slow at satori's real borders
const edged = (edge: string, width: number, style: object, ...children: Child[]) =>
  div(
    { background: edge, padding: width, flexShrink: 0 },
    div({ flexGrow: 1, background: colour.cell, ...style }, ...children)
  );

const cell = (style: object, ...children: Child[]) =>
  div({ background: colour.cell, padding: '28px 36px', ...style }, ...children);

/** A chart, where the gaps between cells are its rules */
const chart = (style: object, ...rows: Child[]) =>
  div({ flexDirection: 'column', gap: hairline, background: colour.rule, ...style }, ...rows);

const frame = (...rows: Child[]) =>
  chart(
    {
      width: '100%',
      height: '100%',
      color: colour.ink,
      fontFamily: 'Atkinson',
      fontSize: 26
    },
    cell(
      { justifyContent: 'space-between', alignItems: 'center', padding: '22px 48px' },
      div(
        { alignItems: 'center', gap: 16, fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em' },
        img(logo, 44),
        site.name
      ),
      div({ color: colour.muted }, new URL(site.url).host)
    ),
    div(
      { flexGrow: 1, padding: '36px 48px 44px', background: colour.ground },
      chart({ flexGrow: 1, padding: hairline }, ...rows)
    )
  );

/** The biggest of these sizes that should fit the text into so many lines of a box */
const fit = (text: string, width: number, lines: number, sizes: number[]) =>
  sizes.find((size) => Math.ceil((text.length * size * 0.56) / width) <= lines) ?? sizes.at(-1)!;

const headline = (text: string, size: number) =>
  div({ fontSize: size, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.03em' }, text);

const lede = (text: string, lines = 2) =>
  div({ color: colour.muted, fontSize: 28, lineHeight: 1.35, lineClamp: lines }, text);

const row = (...cells: Child[]) => div({ flexGrow: 1, gap: hairline }, ...cells);

/** The key row: muted labels over bold values, each cell stretching to fill the line */
const facts = (items: [label: string, value: Child][]) =>
  div(
    { gap: hairline },
    ...items.map(([label, value]) =>
      cell(
        { flex: 1, flexDirection: 'column', gap: 4, padding: '18px 28px' },
        div({ color: colour.muted, fontSize: 22 }, label),
        div({ alignItems: 'center', gap: 12, fontSize: 30, fontWeight: 700 }, value)
      )
    )
  );

const openSquare = (size: number) =>
  div({ width: size, height: size, flexShrink: 0, background: colour.accent });

const chip = ({ name, standard }: { name: string; standard: boolean }) =>
  edged(
    colour.ink,
    hairline,
    {
      alignItems: 'center',
      gap: 10,
      padding: '4px 14px',
      fontFamily: 'Atkinson Mono',
      fontSize: 24,
      letterSpacing: '-0.04em'
    },
    standard && openSquare(14),
    name
  );

/** Chips for two lines of the title cell, leaving room on the second to count the rest */
function chips(ids: string[]) {
  const [line, more] = [714, 150];
  const formats = ids.map(formatLink);
  // the frame, padding and gap, then about 14px a character of mono, plus any open square
  const widths = formats.map(({ name, standard }) => 44 + name.length * 14.4 + (standard ? 24 : 0));
  let [row, used, shown] = [0, 0, formats.length];
  for (const [index, width] of widths.entries()) {
    if (used + width > line) [row, used] = [row + 1, 0];
    const room = row && index < widths.length - 1 ? line - more : line;
    if (row > 1 || used + width > room) {
      shown = index;
      break;
    }
    used += width;
  }
  return div(
    { flexWrap: 'wrap', alignItems: 'center', gap: 12 },
    ...formats.slice(0, shown).map(chip),
    shown < formats.length && div({ color: colour.muted }, `and ${formats.length - shown} more`)
  );
}

/** A big element tile: a number top left, the icon top right, the symbol, then a name */
const element = (face: string, corner: Child, picture: string | null, ...foot: string[]) =>
  cell(
    { width: 264, flexShrink: 0, flexDirection: 'column', padding: 24 },
    div(
      { justifyContent: 'space-between', height: 56 },
      corner || div({}, ''),
      picture && img(picture, 56)
    ),
    div(
      {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: face.length > 3 ? 88 : 132,
        fontWeight: 800,
        letterSpacing: '-0.04em',
        lineHeight: 1
      },
      face
    ),
    foot.length > 0 &&
      div(
        { flexDirection: 'column', lineHeight: 1.2 },
        div({ fontSize: 28, fontWeight: 700 }, foot[0]),
        foot[1] && div({ color: colour.muted, fontSize: 22 }, foot[1])
      )
  );

function tile({ id, name }: Service, size: number) {
  const picture = iconOf(id);
  return edged(
    colour.ink,
    hairline,
    {
      width: size,
      height: size,
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.42,
      fontWeight: 800,
      letterSpacing: '-0.02em'
    },
    picture ? img(picture, size * 0.75) : symbol(name)
  );
}

/** The services people move between most, as many as fit on a line, named or as bare tiles */
function serviceRow(list: Service[], named: boolean) {
  // room is in characters of name, and a tile with its gaps takes about eight
  let room = named ? 76 : 80;
  const picked = busiest(list).filter(({ name }) => (room -= named ? name.length + 8 : 8) >= 0);
  const rest = list.length - picked.length;
  return cell(
    { alignItems: 'center', gap: named ? 36 : 14, padding: '20px 36px' },
    ...picked.map((found) =>
      named
        ? div({ alignItems: 'center', gap: 14, fontWeight: 700 }, tile(found, 56), found.name)
        : tile(found, 64)
    ),
    rest > 0 && div({ color: colour.muted, paddingLeft: named ? 0 : 8 }, `and ${rest} more`)
  );
}

// how smooth a move is, out of three, as in PathBadge
const ease: Record<string, number> = { direct: 3, file: 2, convert: 1 };

const meter = (kind: string) =>
  div(
    { gap: 4 },
    ...[1, 2, 3].map((step) =>
      step <= ease[kind]
        ? div({ width: 14, height: 26, background: colour.accent })
        : edged(colour.accent, 3, { width: 8, height: 20 })
    )
  );

const tallies = () =>
  facts([
    ['Services', String(services().length)],
    ['Categories', String(categories().length)],
    ['File formats', String(formats().length)],
    ['Ways to move', String(migrations().length)]
  ]);

const pitch = (size: number) =>
  cell(
    {
      flexGrow: 1,
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 20,
      padding: '24px 44px'
    },
    headline(site.tagline, size),
    lede(site.description)
  );

const homeImage = () => frame(pitch(80), serviceRow(services(), false), tallies());

const defaultImage = () => frame(pitch(96), tallies());

function serviceImage(found: Service) {
  const title = `Export your data from ${found.name}`;
  const home = category(found.category)!;
  const formatIds = [...new Set(found.export.flatMap((option) => option.formats))];
  return frame(
    row(
      element(
        symbol(found.name),
        String(found.export.length),
        iconOf(found.id),
        found.name,
        home.short ?? home.name
      ),
      cell(
        { flexGrow: 1, flexDirection: 'column', justifyContent: 'space-between', gap: 20 },
        headline(title, fit(title, 720, 2, [68, 60, 52, 46])),
        formatIds.length
          ? chips(formatIds)
          : div({ color: colour.muted }, 'No way out that we know of')
      )
    ),
    facts([
      ['Ways out', String(found.export.length)],
      ['Formats you get', String(formatIds.length)],
      ['Can move to', count(migrationsFrom(found.id).length, 'app')],
      ['Checked', formatDate(found.verification.checked_at)]
    ])
  );
}

function migrationImage({ source, destination, paths: [best] }: Migration) {
  const title = `Move from ${source.name} to ${destination.name}`;
  const end = (found: Service) => element(symbol(found.name), null, iconOf(found.id), found.name);
  const carry = [
    [marks.carried, best.carried.length, 'carry over'],
    [marks.lost, best.lost.length, 'lost'],
    [marks.unsure, best.unknown.length, 'not sure']
  ] as const;
  return frame(
    cell({ padding: '26px 36px' }, headline(title, fit(title, 1020, 1, [64, 56, 50, 44]))),
    row(
      end(source),
      cell(
        { width: 88, flexShrink: 0, alignItems: 'center', justifyContent: 'center', padding: 0 },
        img(arrow, 52)
      ),
      end(destination),
      cell(
        { flexGrow: 1, flexDirection: 'column', justifyContent: 'center', gap: 22, fontSize: 28 },
        div(
          { alignItems: 'center', gap: 16, fontWeight: 700 },
          meter(best.kind),
          pathKinds[best.kind]
        ),
        ...carry.map(([mark, total, label]) =>
          div({ alignItems: 'center', gap: 16 }, img(mark, 32), `${total} ${label}`)
        )
      )
    )
  );
}

function categoryImage(found: Category) {
  const members = servicesIn(found.id);
  const moves = members.reduce((total, { id }) => total + migrationsFrom(id).length, 0);
  return frame(
    row(
      element(initials(found.name), String(members.length), null),
      cell(
        { flexGrow: 1, flexDirection: 'column', justifyContent: 'center', gap: 16 },
        headline(found.name, fit(found.name, 720, 2, [68, 60, 52])),
        lede(found.description),
        div(
          { fontWeight: 700 },
          `${count(members.length, 'service')} and ${count(moves, 'way to move', 'ways to move')}`
        )
      )
    ),
    serviceRow(members, true)
  );
}

function formatImage(found: Format) {
  const users = (list: Service[]) => count(list.length, 'app');
  return frame(
    row(
      element(
        found.extensions[0] ?? symbol(found.name),
        found.standard && openSquare(22),
        null,
        ...(found.extensions.length > 1 ? [found.extensions.join(' ')] : [])
      ),
      cell(
        { flexGrow: 1, flexDirection: 'column', justifyContent: 'center', gap: 18 },
        headline(found.name, fit(found.name, 720, 2, [68, 60, 52, 46])),
        lede(found.description, 3)
      )
    ),
    facts([
      ['Kind', found.standard ? 'Open format' : "One app's own format"],
      ['Exported by', users(exporters(found.id))],
      ['Imported by', users(importers(found.id))]
    ])
  );
}

/** Every card there is, named as ogCard() in site.ts names them */
export const cards = () => [
  'index',
  'default',
  ...categories().map(({ id }) => `categories/${id}`),
  ...services().map(({ id, category: home }) => `${home}/${id}`),
  ...migrations().map(({ source, destination }) => `migrate/${source.id}/${destination.id}`),
  ...formats().map(({ id }) => `formats/${id}`)
];

function image(card: string) {
  const [first, second = '', third = ''] = card.split('/');
  if (card === 'index') return homeImage();
  if (card === 'default') return defaultImage();
  if (first === 'categories') return category(second) && categoryImage(category(second)!);
  if (first === 'formats') return format(second) && formatImage(format(second)!);
  if (first === 'migrate') {
    const found = migration(second, third);
    return found && migrationImage(found);
  }
  const found = service(second);
  return found?.category === first && serviceImage(found);
}

const fontFiles = [
  ['Atkinson', 'atkinson-hyperlegible-next', 400],
  ['Atkinson', 'atkinson-hyperlegible-next', 700],
  ['Atkinson', 'atkinson-hyperlegible-next', 800],
  ['Atkinson Mono', 'atkinson-hyperlegible-mono', 400]
] as const;

// satori keeps one font per name, so each subset goes in under its own
const subsets = ['latin', 'latin-ext'];

let fonts: { name: string; data: Buffer; weight: 400 | 700 | 800 }[] | undefined;
let wasm: Promise<void> | undefined;

/** The PNG for one of cards(), or undefined if there's no such card */
export async function drawCard(card: string) {
  const node = image(card);
  if (!node) return undefined;
  fonts ??= subsets.flatMap((subset) =>
    fontFiles.map(([name, file, weight]) => ({
      name: subset === 'latin' ? name : `${name} ${subset}`,
      data: readFileSync(
        resolve(`node_modules/@fontsource/${file}/files/${file}-${subset}-${weight}-normal.woff`)
      ),
      weight
    }))
  );
  wasm ??= initWasm(readFileSync(resolve('node_modules/@resvg/resvg-wasm/index_bg.wasm')));
  const drawn = await satori(node as never, { ...ogSize, fonts });
  await wasm;
  const resvg = new Resvg(drawn);
  const rendered = resvg.render();
  const png = Buffer.from(rendered.asPng());
  rendered.free();
  resvg.free();
  return png;
}
