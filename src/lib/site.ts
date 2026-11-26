export const site = {
  name: 'Exit Format',
  url: 'https://exitformat.peng.ly',
  repo: 'https://github.com/NotAFlightRisk/exitformat',
  tagline: 'Your data has an exit.',
  description:
    "Exporting from an app rarely gets you everything. Find out what's in an export, what it leaves out, and which apps can open it."
};

// every page lives at its path with no trailing slash, and the home page at /
export const absolute = (path: string) => new URL(path, site.url).href;

export const href = {
  category: (id: string) => `/categories/${id}`,
  service: (category: string, id: string) => `/${category}/${id}`,
  migration: (source: string, destination: string) => `/migrate/${source}/${destination}`,
  format: (id: string) => `/formats/${id}`,
  conversion: (from: string, to: string) => `/formats/${from}#to-${to}`
};

export const ogSize = { width: 1200, height: 630 };
export const defaultCard = '/og/default.png';

// the square npm run icons saves every service icon at, big enough to fill an app page's figure
export const iconSize = 128;

// routes that draw their own share card, at /og/<path>.png, while the rest share one
const carded = new Set([
  '/',
  '/[category]/[service]',
  '/categories/[category]',
  '/migrate/[source]/[destination]',
  '/formats/[format]'
]);

export const ogCard = (route: string | null, path: string) =>
  route && carded.has(route) ? `/og/${path.slice(1) || 'index'}.png` : defaultCard;

const file = (category: string, id: string) => `data/services/${category}/${id}.yml`;
export const editUrl = (category: string, id: string) =>
  `${site.repo}/edit/main/${file(category, id)}`;
export const historyUrl = (category: string, id: string) =>
  `${site.repo}/commits/main/${file(category, id)}`;
export const pullUrl = (pr: number) => `${site.repo}/pull/${pr}`;

/** The fix-an-entry issue form, with the page already filled in */
export const fixUrl = (name: string, path: string) =>
  `${site.repo}/issues/new?${new URLSearchParams({
    template: 'fix-entry.yml',
    title: `[Data]: ${name}`,
    page: absolute(path)
  })}`;
export const commitUrl = (commit: string) => `${site.repo}/commit/${commit}`;

// the about page's other projects, with their logos in static/apps
export const relatedApps = [
  {
    slug: 'fineprint',
    name: 'fineprint',
    about: 'A VPN comparison with no affiliate links and a source for every claim',
    url: 'https://fineprint.peng.ly'
  },
  {
    slug: 'android-rom-compat',
    name: 'Android ROM Compat',
    about: 'Which custom ROMs run on your Android phone, and how well',
    url: 'https://android-rom-compat.peng.ly'
  },
  {
    slug: 'enshittification',
    name: 'The Enshittification Index',
    about: 'A dated, sourced record of big tech making things worse',
    url: 'https://enshittification.peng.ly'
  },
  {
    slug: 'haveibeentrainedon',
    name: 'Have I Been Trained On?',
    about: 'Find out if your writing ended up in AI training data',
    url: 'https://haveibeentrainedon.peng.ly'
  }
];
