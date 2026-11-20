import { describe, expect, it } from 'vitest';
import { directoryJson, routesJson, serviceJson } from '#lib/data/api.ts';
import { migrations } from '#lib/data/compat.ts';
import { loadSources, toDirectory } from '#lib/data/load.ts';

const directory = toDirectory(loadSources('tests/fixtures/data'), new Date('2026-11-20'));
const guides = migrations(directory);
const icon = (id: string) => (id === 'jotter' ? '/icons/jotter.png' : null);
const format = (id: string) => directory.formats.find((found) => found.id === id);
const service = (id: string) => directory.services.find((found) => found.id === id)!;

describe('api', () => {
  it('keeps directory.json to the data, with nothing worked out pair by pair', () => {
    const body = directoryJson(directory, '2026-11-20', icon);
    expect(Object.keys(body)).toEqual([
      'name',
      'url',
      'licence',
      'updated',
      'categories',
      'formats',
      'services'
    ]);
    expect(body.services.find(({ id }) => id === 'jotter')).toMatchObject({
      category: 'notes',
      url: 'https://exitformat.peng.ly/notes/jotter',
      icon: 'https://exitformat.peng.ly/icons/jotter.png'
    });
  });

  it('lists every guided move in routes.json as one line with its guide, and nothing else', () => {
    const guide = (source: string, destination: string, counts: number[]) => {
      const [carried, lost, unknown] = counts;
      const url = `https://exitformat.peng.ly/migrate/${source}/${destination}`;
      return { source, destination, url, carried, lost, unknown };
    };
    expect(routesJson(guides, '2026-11-20')).toEqual({
      name: 'Exit Format',
      url: 'https://exitformat.peng.ly',
      licence: expect.stringMatching(/^MIT/),
      updated: '2026-11-20',
      routes: [
        guide('otpvault', 'jotter', [2, 0, 1]),
        guide('otpvault', 'keyring', [2, 0, 1]),
        guide('scribble', 'jotter', [2, 2, 1]),
        guide('scribble', 'quill', [2, 1, 0]),
        guide('tokenbox', 'keyring', [2, 1, 1]),
        guide('tokenbox', 'lockbox', [3, 0, 1])
      ]
    });
  });

  it('wraps each service in the same envelope, with its formats and guided moves', () => {
    const scribble = service('scribble');
    const body = serviceJson(
      scribble,
      format,
      {
        out: guides.filter(({ source }) => source === scribble),
        in: guides.filter(({ destination }) => destination === scribble)
      },
      '2026-11-20',
      icon
    );
    expect(body).toMatchObject({
      name: 'Exit Format',
      updated: '2026-11-20',
      service: { id: 'scribble', url: 'https://exitformat.peng.ly/notes/scribble', icon: null },
      exports: [
        { id: 'scribble-zip', name: 'Scribble export', standard: false },
        { id: 'markdown', name: 'Markdown', standard: true }
      ],
      imports: [{ id: 'markdown', name: 'Markdown', standard: true }],
      routes_in: []
    });
    expect(body.routes_out.map(({ url }) => url)).toEqual([
      'https://exitformat.peng.ly/migrate/scribble/jotter',
      'https://exitformat.peng.ly/migrate/scribble/quill'
    ]);
  });
});
