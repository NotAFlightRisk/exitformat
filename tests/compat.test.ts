import { describe, expect, it } from 'vitest';
import { better, carry, guided, migrations, openings, paths } from '#lib/data/compat.ts';
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

  it('counts an importer named for the source as direct', () => {
    expect(routes('otpvault', 'keyring').map(({ kind }) => kind)).toEqual(['direct']);
  });

  it("counts an importer for the source's own format as direct, even with no from", () => {
    expect(routes('tokenbox', 'keyring')).toEqual([
      expect.objectContaining({ kind: 'direct', formats: ['tokenbox-backup'] })
    ]);
  });

  it("never counts a third app writing someone else's format as direct", () => {
    expect(
      routes('vaultkeep', 'lockbox')
        .filter(({ formats }) => formats.includes('tokenbox-backup'))
        .map(({ kind }) => kind)
    ).toEqual(['file']);
  });

  it('counts an app format nobody we list owns as a file route', () => {
    expect(
      routes('vaultkeep', 'lockbox')
        .filter(({ formats }) => formats.includes('pass-export'))
        .map(({ kind }) => kind)
    ).toEqual(['file']);
  });

  it('keeps a shared open format as a file route', () => {
    expect(routes('keyring', 'tokenbox').map(({ kind, formats }) => [kind, formats])).toEqual([
      ['file', ['otpauth-uri']]
    ]);
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
  it('gives a pair a guide only when one of its routes is direct', () => {
    expect(guided(routes('scribble', 'jotter'))).toBe(true);
    expect(guided(routes('quill', 'jotter'))).toBe(false);
    expect(guided(routes('scribble', 'papyrus'))).toBe(false);
  });

  it('leaves out two apps in one category that only share an open format', () => {
    expect(routes('keyring', 'tokenbox')).not.toEqual([]);
    expect(migration('keyring', 'tokenbox')).toBeUndefined();
    expect(migration('quill', 'jotter')).toBeUndefined();
  });

  it('skips a shared standard format between two categories', () => {
    expect(migration('keyring', 'jotter')).toBeUndefined();
    expect(migration('otpvault', 'lockbox')).toBeUndefined();
  });

  it("links two categories through one app's own format", () => {
    expect(migration('tokenbox', 'lockbox')?.paths).toEqual([
      expect.objectContaining({ kind: 'direct', formats: ['tokenbox-backup'] })
    ]);
  });

  it('keeps only the built-in importer between two categories', () => {
    expect(migration('otpvault', 'jotter')?.paths.map(({ kind }) => kind)).toEqual(['direct']);
  });

  it('keeps the file routes alongside the direct one in a category', () => {
    expect(migration('scribble', 'jotter')?.paths.map(({ kind }) => kind)).toEqual([
      'direct',
      'file'
    ]);
  });

  it('gives no guide to apps that only share a format someone else owns', () => {
    expect(migration('vaultkeep', 'lockbox')).toBeUndefined();
    expect(migration('vaultkeep', 'keyring')).toBeUndefined();
  });

  it('lists exactly the pairs guided() says get a guide', () => {
    for (const source of directory.services)
      for (const destination of directory.services)
        if (source !== destination)
          expect([
            source.id,
            destination.id,
            Boolean(migration(source.id, destination.id))
          ]).toEqual([source.id, destination.id, guided(paths(source, destination, formats))]);
  });

  it('never sends a service to itself', () => {
    expect(found.filter(({ source, destination }) => source === destination)).toEqual([]);
  });
});

describe('openings', () => {
  const listed = (id: string, side: 'out' | 'in', from = directory) => {
    const { rows, reach } = openings(from, migrations(from))(
      from.services.find((found) => found.id === id)!,
      side
    );
    const shown = rows.map(({ format, conversion, services, more }) => ({
      format,
      via: conversion?.from,
      services: services.map(({ id }) => id),
      more
    }));
    return { shown, reach };
  };
  const row = (format: string, services: string[], via?: string, more = 0) => ({
    format,
    via,
    services,
    more
  });

  it('groups the apps that only share an open format by that format', () => {
    expect(listed('quill', 'out')).toEqual({
      shown: [row('markdown', ['jotter', 'scribble'])],
      reach: 2
    });
  });

  it('leaves out apps with a guide and apps in other categories, but counts them all in reach', () => {
    expect(listed('jotter', 'in')).toEqual({ shown: [row('markdown', ['quill'])], reach: 3 });
  });

  it('falls back to a conversion when there is no shared format', () => {
    expect(listed('scribble', 'out').shown).toEqual([row('html', ['papyrus'], 'scribble-zip')]);
  });

  it("lists an app format nobody owns, and someone else's, once there's no guide", () => {
    expect(listed('vaultkeep', 'out').shown).toEqual([
      row('pass-export', ['lockbox']),
      row('tokenbox-backup', ['lockbox'])
    ]);
  });

  it('shows four apps a row, most guides first, and counts the rest', () => {
    const clone = (at: number) => ({
      ...service('scribble'),
      id: `scribble-${at}`,
      name: `Zed ${at}`
    });
    const crowd = {
      ...directory,
      services: [...directory.services, ...Array.from({ length: 6 }, (_, at) => clone(at))]
    };
    expect(listed('quill', 'out', crowd).shown).toEqual([
      row('markdown', ['jotter', 'scribble', 'scribble-0', 'scribble-1'], undefined, 4)
    ]);
  });

  it('lists an app under one conversion, however many reach it', () => {
    const twice = {
      ...directory,
      formats: directory.formats.map((format) =>
        format.id === 'scribble-zip'
          ? {
              ...format,
              conversions: [...format.conversions, { ...format.conversions[0], tool: 'Rezipper' }]
            }
          : format
      )
    };
    expect(listed('scribble', 'out', twice).shown).toEqual([
      row('html', ['papyrus'], 'scribble-zip')
    ]);
  });
});
