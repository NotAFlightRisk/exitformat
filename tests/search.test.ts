import { describe, expect, it } from 'vitest';
import { migrations } from '#lib/data/compat.ts';
import { loadSources, toDirectory } from '#lib/data/load.ts';
import { buildIndex, search } from '#lib/search.ts';

const directory = toDirectory(loadSources('tests/fixtures/data'), new Date('2026-11-20'));
const index = buildIndex(directory, migrations(directory), (id) => id === 'jotter');
const top = (query: string) => search(index, query)[0];
const names = (query: string) => search(index, query).map(({ name }) => name);

describe('search', () => {
  it('finds a service by its name, an alias, the start of it or a typo', () => {
    for (const query of ['Jotter', 'jotter notes', 'jot', 'jottr'])
      expect(top(query)).toEqual({
        kind: 'service',
        name: 'Jotter',
        href: '/notes/jotter',
        detail: 'Notes',
        icon: '/icons/jotter.png'
      });
  });

  it('looks past the words people wrap round a name', () => {
    expect(top('how do I export my data from Quill')).toMatchObject({ name: 'Quill' });
  });

  it('finds a format by its extension, with or without the dot', () => {
    for (const query of ['.keyring', 'KEYRING vault'])
      expect(top(query)).toMatchObject({ kind: 'format', href: '/formats/keyring-vault' });
    expect(names('keyring').slice(0, 2)).toEqual(['Keyring', 'Keyring vault']);
  });

  it('lists the services that use a format under the format itself', () => {
    expect(search(index, 'otpauth').map(({ name, detail }) => `${name}: ${detail}`)).toEqual([
      'otpauth links: .txt',
      'Keyring: Exports otpauth links',
      'Tokenbox: Imports otpauth links'
    ]);
  });

  it('finds a category by its name or short name', () => {
    expect(top('2fa')).toMatchObject({ kind: 'category', name: 'Two-factor authentication' });
    expect(top('two factor')).toMatchObject({ detail: '3 services' });
  });

  it('turns "X to Y" into the migration when there is one', () => {
    for (const query of [
      'keyring to tokenbox',
      'from Keyring to Tokenbox',
      'move keyring -> tokenbox',
      'keyring → tok'
    ])
      expect(top(query)).toEqual({
        kind: 'migration',
        name: 'Keyring to Tokenbox',
        href: '/migrate/keyring/tokenbox',
        detail: '',
        icon: null,
        route: {
          source: { name: 'Keyring', icon: null },
          destination: { name: 'Tokenbox', icon: null },
          kind: { id: 'file', label: 'Same file format' },
          carried: 2,
          lost: 2,
          unknown: 0
        }
      });
  });

  it('shows both ends but no migration when there is no way between them', () => {
    expect(search(index, 'tokenbox to quill').map(({ kind, name }) => `${kind} ${name}`)).toEqual([
      'service Quill',
      'service Tokenbox'
    ]);
  });

  it('waits for an end that a crowd still fits before reading it as a service', () => {
    const tally = (at: number) => ({
      ...index.services[0],
      id: `tally-${at}`,
      name: `Tally ${at}`
    });
    const busy = {
      ...index,
      services: [...index.services, ...Array.from({ length: 11 }, (_, at) => tally(at))]
    };
    expect(search(busy, 'keyring to t').filter(({ name }) => name.startsWith('Tally'))).toEqual([]);
  });

  it('finds nothing for nothing, or for words that match nothing', () => {
    expect(search(index, '  ')).toEqual([]);
    expect(search(index, 'xyzzy')).toEqual([]);
  });
});
