import { absolute } from '#lib/site.ts';

export const websiteId = absolute('/#website');
export const publisherId = absolute('/#publisher');

/** A schema.org HowTo, for a set of steps someone can follow */
export const howTo = (name: string, url: string, steps: string[]) => ({
  '@type': 'HowTo',
  name,
  url,
  step: steps.map((text, index) => ({ '@type': 'HowToStep', position: index + 1, text }))
});
