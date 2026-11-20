export const site = {
  name: 'Exit Format',
  url: 'https://exitformat.peng.ly',
  repo: 'https://github.com/NotAFlightRisk/exitformat',
  tagline: 'Your data has an exit.',
  description:
    'How to export your data from online services, what formats you get, and where it can go.'
};

// every page lives at its path with no trailing slash, and the home page at /
export const absolute = (path: string) => new URL(path, site.url).href;

export const href = {
  category: (id: string) => `/categories/${id}`,
  service: (category: string, id: string) => `/${category}/${id}`,
  migration: (source: string, destination: string) => `/migrate/${source}/${destination}`,
  format: (id: string) => `/formats/${id}`
};

const file = (category: string, id: string) => `data/services/${category}/${id}.yml`;
export const editUrl = (category: string, id: string) =>
  `${site.repo}/edit/main/${file(category, id)}`;
export const historyUrl = (category: string, id: string) =>
  `${site.repo}/commits/main/${file(category, id)}`;
