import { describe, expect, it } from 'vitest';
import { better, carry, migrations, paths } from '#lib/data/compat.ts';
import { loadSources, toDirectory } from '#lib/data/load.ts';
import type { Path } from '#lib/data/types.ts';

const directory = toDirectory(loadSources('tests/fixtures/data'), new Date('2026-11-20'));
const formats = new Map(directory.formats.map((format) => [format.id, format]));
const service = (id: string) => directory.services.find((service) => service.id === id)!;
const routes = (from: string, to: string) => paths(service(from), service(to), formats);
const found = migrations(directory);
const migration = (from: string, to: string) =>
  found.find(({ source, destination }) => source.id === from && destination.id === to);

describe('paths', () => {
  it('ranks importer over shared format over conversion, whatever they carry', () => {
    const path = (kind: Path['kind'], carried: number) =>
      ({ kind, carried: Array(carried).fill('pages') }) as Path;
    const ranked = [path('convert', 3), path('file', 2), path('direct', 1)].sort(better);
    expect(ranked.map(({ kind }) => kind)).toEqual(['direct', 'file', 'convert']);
  });

  it('leaves conversions out when there is already a real way across', () => {
    expect(routes('scribble', 'jotter').map(({ kind }) => kind)).toEqual(['direct', 'file']);
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

  it('converts through a format the import takes when nothing else fits', () => {
    expect(routes('scribble', 'papyrus')).toEqual([
      expect.objectContaining({
        kind: 'convert',
        conversion: expect.objectContaining({ from: 'scribble-zip', to: 'html', tool: 'Unzipper' }),
        carried: ['pages', 'attachments'],
        unknown: ['tags', 'history']
      })
    ]);
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

  it("never passes off a file importer as a sign-in when the source can't make the file", () => {
    expect(routes('keyring', 'lockbox').map((path) => path.import.id)).toEqual(['json']);
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

  it('counts each unknown once, and never one already lost', () => {
    const exported = { included: ['a', 'b'], excluded: [], unknown: ['c', 'd'] };
    expect(carry(exported, { excluded: ['b'], unknown: ['a', 'b', 'c'] })).toEqual({
      carried: [],
      lost: ['b'],
      unknown: ['a', 'c', 'd']
    });
  });

  it("keeps an import's unknown as unknown, even when it lists what it keeps", () => {
    const exported = { included: ['a', 'b'], excluded: [], unknown: [] };
    expect(carry(exported, { included: ['a'], unknown: ['b'] })).toEqual({
      carried: ['a'],
      lost: [],
      unknown: ['b']
    });
  });

  it("doubts what the export has when the import isn't sure it keeps it", () => {
    const exported = { included: ['a', 'b'], excluded: [], unknown: [] };
    expect(carry(exported, { unknown: ['b'] })).toEqual({
      carried: ['a'],
      lost: [],
      unknown: ['b']
    });
  });

  it("loses whatever the import drops, even if the export wasn't sure it had it", () => {
    const exported = { included: ['a'], excluded: [], unknown: ['b'] };
    expect(carry(exported, { included: ['a', 'b'], excluded: ['b'] })).toEqual({
      carried: ['a'],
      lost: ['b'],
      unknown: []
    });
  });

  it("never counts the export's unknowns as carried, whatever the import keeps", () => {
    const exported = { included: ['a'], excluded: [], unknown: ['b'] };
    expect(carry(exported, { included: ['a', 'b'] }).unknown).toEqual(['b']);
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
  it('skips a shared standard format between two categories', () => {
    expect(migration('keyring', 'jotter')).toBeUndefined();
    expect(migration('otpvault', 'lockbox')).toBeUndefined();
  });

  it("links two categories through one app's own format", () => {
    expect(migration('tokenbox', 'lockbox')?.paths).toEqual([
      expect.objectContaining({ kind: 'file', formats: ['tokenbox-backup'] })
    ]);
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
