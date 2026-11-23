import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { iconDir, services } from '#lib/server/directory.ts';
import { iconSize as size } from '#lib/site.ts';

// npm run icons fetches every missing icon, npm run icons -- notion refetches that one
const { positionals: asked } = parseArgs({ allowPositionals: true });

const favicon = (website: string) =>
  `https://www.google.com/s2/favicons?domain=${new URL(website).host}&sz=${size}`;
const isPng = (bytes: Buffer) => bytes.length > 24 && bytes.readUInt32BE(0) === 0x89504e47;
const fits = (png: Buffer) => png.readUInt32BE(16) === size && png.readUInt32BE(20) === size;

/** The image as a square PNG, redrawn by resvg unless it already is one the right size */
function toPng(bytes: Buffer, type: string) {
  if (isPng(bytes) && fits(bytes)) return bytes;
  const data = `data:${type};base64,${bytes.toString('base64')}`;
  const frame = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><image href="${data}" width="${size}" height="${size}"/></svg>`;
  const drawn = new Resvg(frame).render();
  // resvg quietly draws nothing for a file it can't read
  if (!drawn.pixels.some((value, at) => at % 4 === 3 && value > 0))
    throw new Error(`came out blank, resvg can't read ${type}`);
  return Buffer.from(drawn.asPng());
}

async function download(url: string) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  const type = response.headers.get('content-type')?.split(';')[0].trim() ?? '';
  const bytes = Buffer.from(await response.arrayBuffer());
  // a bot wall is a web page that says 200
  if (!type.startsWith('image/') && !isPng(bytes))
    throw new Error(`${url} sent ${type || 'something'} rather than an image`);
  return toPng(bytes, type);
}

await initWasm(readFileSync(resolve('node_modules/@resvg/resvg-wasm/index_bg.wasm')));
mkdirSync(iconDir, { recursive: true });

const byId = new Map(services().map((service) => [service.id, service]));
const due = asked.length
  ? asked
  : [...byId.keys()].filter((id) => !existsSync(join(iconDir, `${id}.png`)));

let failed = 0;
for (const id of due) {
  try {
    const service = byId.get(id);
    if (!service) throw new Error("there's no service with that id");
    const url = service.icon ?? favicon(service.website);
    writeFileSync(join(iconDir, `${id}.png`), await download(url));
    console.log(`✓ ${id} from ${url}`);
  } catch (error) {
    failed++;
    console.error(`✗ ${id}: ${error instanceof Error ? error.message : error}`);
  }
}

console.log(`\n${due.length - failed} of ${due.length} saved to ${relative('.', iconDir)}`);
process.exitCode = failed ? 1 : 0;
