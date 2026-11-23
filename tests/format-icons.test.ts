import { describe, expect, it } from 'vitest';
import { loadSources, toDirectory } from '#lib/data/load.ts';
import { formatMark, markFor, viewBox } from '#lib/format-icons.ts';

describe('markFor', () => {
  it('gives files of the same kind the same mark', () => {
    expect(markFor(['.csv'])).toBe('table');
    expect(markFor(['.xlsx'])).toBe('table');
    expect(markFor(['.json'])).toBe('json');
  });

  it('goes by the first extension it knows', () => {
    expect(markFor(['.md', '.markdown'])).toBe('markdown');
    expect(markFor(['.backup', '.html'])).toBe('html');
  });

  it('has nothing for an extension it has never heard of, or none at all', () => {
    expect(markFor(['.bear2bk'])).toBeNull();
    expect(markFor([])).toBeNull();
  });

  // the plain square still covers one without, but it's easy to miss adding a format here
  it('has a mark for every open format in the directory', () => {
    const { formats } = toDirectory(loadSources('data'), new Date());
    const bare = formats
      .filter(({ standard, extensions }) => standard && !markFor(extensions))
      .map(({ id }) => id);
    expect(bare).toEqual([]);
  });
});

describe('viewBox', () => {
  it('leaves a drawing its own box and gives a logo room round it', () => {
    expect(viewBox(formatMark('table'))).toBe('0 0 16 16');
    expect(viewBox(formatMark('markdown'))).toBe('-2 -2 28 28');
  });
});
