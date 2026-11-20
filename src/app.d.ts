import type { Crumb, Meta } from '#lib/data/types.ts';

declare global {
  namespace App {
    interface PageData {
      meta?: Meta;
      crumbs?: Crumb[];
      status?: number;
    }
  }
}

export {};
