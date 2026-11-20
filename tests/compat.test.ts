import { describe, expect, it } from 'vitest';
import { carry, migrations, paths } from '#lib/data/compat.ts';
import { loadSources, toDirectory } from '#lib/data/load.ts';

const directory = toDirectory(loadSources('tests/fixtures/data'), new Date('2026-11-20'));
const formats = new Map(directory.formats.map((format) => [format.id, format]));
const service = (id: string) => directory.services.find((service) => service.id === id)!;
const routes = (from: string, to: string) => paths(service(from), service(to), formats);
const found = migrations(directory);
const migration = (from: string, to: string) =>
  found.find(({ source, destination }) => source.id === from && destination.id === to);

describe('paths', () => {
  it('ranks importer over shared format over conversion, whatever they carry', () => {
    expect(routes('scribble', 'jotter').map(({ kind, carried }) => [kind, carried.length])).toEqual(
      [
        ['direct', 2],
        ['file', 1],
        ['convert', 3]
      ]
    );
  });

  it('ranks paths of the same kind by how much makes it across', () => {
    expect(routes('quill', 'jotter').map((path) => path.export?.id)).toEqual([
      'everything',
      'page'
    ]);
  });

  it('pairs a built-in importer with the export whose format it reads', () => {
    const [direct] = routes('scribble', 'jotter');
    expect([direct.export?.id, direct.import.id, direct.formats]).toEqual([
      'workspace',
      'scribble',
      ['scribble-zip']
    ]);
  });

  it('converts through a format the import takes', () => {
    expect(routes('scribble', 'jotter')[2].conversion).toMatchObject({
      from: 'scribble-zip',
      to: 'html',
      tool: 'Unzipper'
    });
  });

  it('lets a sign-in importer through with no export at all', () => {
    expect(routes('scribble', 'quill')).toEqual([
      expect.objectContaining({
        kind: 'direct',
        export: undefined,
        carried: ['pages', 'comments'],
        lost: ['attachments']
      })
    ]);
  });

  it('ignores an importer built for some other service', () => {
    expect(routes('keyring', 'jotter').map((path) => path.import.id)).toEqual(['json']);
  });
});

describe('carry', () => {
  it('carries what the export has, less what the import drops or does not keep', () => {
    const exported = { included: ['a', 'b', 'c'], excluded: ['d'], unknown: ['e'] };
    expect(carry(exported, { included: ['a', 'b'], excluded: ['b'] })).toEqual({
      carried: ['a'],
      lost: ['d', 'b', 'c'],
      unknown: ['e']
    });
  });

  it('carries the whole export when the import says nothing', () => {
    expect(carry({ included: ['a'], excluded: ['b'], unknown: ['c'] })).toEqual({
      carried: ['a'],
      lost: ['b'],
      unknown: ['c']
    });
  });

  it('counts each unknown once, and never one already carried or lost', () => {
    const exported = { included: ['a', 'b'], excluded: [], unknown: ['c', 'd'] };
    expect(carry(exported, { excluded: ['b'], unknown: ['a', 'b', 'c'] }).unknown).toEqual([
      'c',
      'd'
    ]);
  });

  it("goes by the import's own lists when there's no export", () => {
    expect(carry(undefined, { included: ['a'], excluded: ['b'], unknown: ['c'] })).toEqual({
      carried: ['a'],
      lost: ['b'],
      unknown: ['c']
    });
  });
});

describe('migrations', () => {
  it('skips a shared format between two categories', () => {
    expect(migration('keyring', 'jotter')).toBeUndefined();
  });

  it('keeps only the built-in importer between two categories', () => {
    expect(migration('otpvault', 'jotter')?.paths.map(({ kind }) => kind)).toEqual(['direct']);
  });

  it('links services in one category through a shared format', () => {
    expect(migration('keyring', 'tokenbox')?.paths.map(({ kind }) => kind)).toEqual(['file']);
  });

  it('never sends a service to itself', () => {
    expect(found.filter(({ source, destination }) => source === destination)).toEqual([]);
  });
});
