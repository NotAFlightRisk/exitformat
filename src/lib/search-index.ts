import type { SearchIndex } from '#lib/search.ts';

let loading: Promise<SearchIndex> | undefined;

/** The search index, fetched the first time anything asks, and again if that try failed */
export function searchIndex() {
  // Cloudflare holds JSON for hours unless it's asked to check
  loading ??= fetch('/api/search.json', { cache: 'no-cache' })
    .then((response) => {
      if (!response.ok) throw new Error(`The search index came back ${response.status}`);
      return response.json() as Promise<SearchIndex>;
    })
    .catch((error) => {
      loading = undefined;
      throw error;
    });
  return loading;
}
