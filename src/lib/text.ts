const day = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC'
});

/** 2026-11-20 -> 20 Nov 2026 */
export const formatDate = (iso: string) => day.format(new Date(iso));

/** service or services, depending on the total */
export const plural = (total: number, one: string, many = `${one}s`) =>
  total === 1 ? one : many;

/** 1 service, 3 services */
export const count = (total: number, one: string, many?: string) =>
  `${total} ${plural(total, one, many)}`;

// two-letter symbols that read as plain English words
const realWords = new Set(
  'am an as at be by do go he hi if in is it me my no of oh ok on or so to up us we'.split(' ')
);

const pair = (first: string, second: string) =>
  first.toUpperCase() + (/\d/.test(first) ? second.toUpperCase() : second.toLowerCase());

const word = (symbol: string) => realWords.has(symbol.toLowerCase());

/** Two letters for a service's tile, like an element on the periodic table: Notion -> Nt */
export function symbol(name: string) {
  const [first = '?', ...rest] = name.replace(/\s+/g, '');
  const consonants = rest.filter((letter) => /[b-df-hj-np-tv-z]/i.test(letter));
  const options = [rest[0] ?? '', ...consonants].map((second) => pair(first, second));
  return options.find((option) => !word(option)) ?? options[0];
}

const filler = new Set(['and', 'of', 'the', 'for', '&']);

/** A category's symbol, from its first and last proper words: Notes and knowledge -> Nk */
export function initials(name: string) {
  const words = name.split(/[\s-]+/).filter((each) => !filler.has(each.toLowerCase()));
  const both = words.length > 1 && pair(words[0][0], words.at(-1)![0]);
  return both && !word(both) ? both : symbol(name);
}

const archived = /^https?:\/\/web\.archive\.org\/web\/(\d{4})(\d{2})(\d{2})\d*\/(.+)$/;

const place = (url: string) => {
  const { hostname, pathname } = new URL(/^https?:\/\//.test(url) ? url : `https://${url}`);
  return hostname.replace(/^www\./, '') + pathname.replace(/\/$/, '');
};

/** Where an evidence link points, and when it was archived if it's a Wayback copy */
export function source(url: string): { place: string; archived?: string } {
  const copy = url.match(archived);
  if (!copy) return { place: place(url) };
  const [, year, month, date, original] = copy;
  return { place: place(original), archived: formatDate(`${year}-${month}-${date}`) };
}
