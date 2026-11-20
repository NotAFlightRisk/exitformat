import { describe, expect, it } from 'vitest';
import { check } from '#lib/data/check.ts';
import { loadSources } from '#lib/data/load.ts';

const today = new Date('2026-11-20');
const broken = check(loadSources('tests/fixtures/broken'), { today });
const good = check(loadSources('tests/fixtures/data'), { today });
const said = (problems: typeof good, file: string, path = '') =>
  problems.filter((problem) => problem.file.endsWith(file) && problem.path === path);
const one = (line: number, message: string | RegExp, warning = false) => [
  expect.objectContaining({ line, message: expect.stringMatching(message), warning })
];

describe('cross-references', () => {
  it.each([
    [
      'an unknown format',
      'notes/jotter.yml',
      'export[0].formats[1]',
      11,
      /"scroll" isn't a format/
    ],
    [
      'an off-list data type',
      'notes/jotter.yml',
      'export[0].data.included[1]',
      16,
      /pages, tags, settings/
    ],
    [
      'data both included and excluded',
      'notes/jotter.yml',
      'export[0].data.excluded[0]',
      17,
      /included/
    ],
    [
      'a reused option id',
      'notes/jotter.yml',
      'export[1].id',
      19,
      /already used by another export/
    ],
    [
      'a from we have no file for',
      'notes/jotter.yml',
      'import[0].from[0]',
      34,
      /"nobody" isn't in/
    ],
    ['an option with no docs or sources', 'notes/jotter.yml', 'import[1]', 39, /needs docs/],
    ['an unknown based_on', 'formats/zine.yml', 'based_on', 3, /"paper" isn't a format/],
    ['an unknown conversion target', 'formats/zine.yml', 'conversions[0].to', 6, /"pamphlet"/],
    ['a service id in two categories', 'notes/jotter.yml', '', 1, /also in services\/2fa/],
    ['the other half of that pair', '2fa/jotter.yml', '', 1, /also in services\/notes/],
    ['a category named after one of our pages', 'categories/migrate.yml', '', 1, /our own pages/],
    ['a file name that is not kebab-case', 'notes/Odd_Name.yml', '', 1, /lowercase-with-dashes/],
    ['a service with no category file', 'music/tune.yml', '', 1, /no categories\/music.yml/],
    ['a check dated in the future', 'music/tune.yml', 'verification.checked_at', 12, /future/]
  ])('flags %s on its line', (_, file, path, line, message) => {
    expect(said(broken, file, path)).toEqual(one(line, message));
  });
});

describe('schema', () => {
  it.each([
    ['an http link', 'website', 2, 'should be a full https:// link'],
    [
      'a deployment off the list',
      'deployment',
      4,
      /"everywhere" isn't an option - use one of local/
    ],
    ['a field we do not track', 'colour', 6, /"colour" isn't a field here/],
    ['an export method that does not exist', 'export[0].method', 11, /"teleport" isn't an option/],
    ['more than four steps', 'export[0].steps', 13, 'can have 4 at most'],
    ['a file import with no formats', 'import[0]', 24, 'needs formats'],
    ['a step over 140 characters', 'import[0].steps[1]', 29, 'should be 140 characters or fewer'],
    ['a date that never happened', 'verification.checked_at', 34, 'should be a real date'],
    ['a step with an unquoted colon', 'delete.steps[0]', 38, /wrap it in quotes/]
  ])('explains %s on its line', (_, path, line, message) => {
    expect(said(broken, 'notes/shabby.yml', path)).toEqual(one(line, message));
  });

  it('points broken YAML at the line it breaks on', () => {
    expect(said(broken, 'notes/garbled.yml')[0]).toMatchObject({ line: 2, warning: false });
  });
});

describe('warnings', () => {
  it('passes good data with nothing worse than a warning', () => {
    expect(good.filter((problem) => !problem.warning)).toEqual([]);
  });

  it('only warns about missing docs when there are sources instead', () => {
    expect(said(good, '2fa/tokenbox.yml', 'import[0]')).toEqual(one(21, /no official docs/, true));
  });

  it('warns once a check is over a year old', () => {
    expect(said(good, '2fa/tokenbox.yml', 'verification.checked_at')).toEqual(
      one(32, /over a year old/, true)
    );
  });
});
