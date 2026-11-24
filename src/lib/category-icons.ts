// one path per category on Icon.svelte's 16px grid, and the rest make do with initials
const icons: Record<string, string> = {
  // a padlock with a code in it
  '2fa':
    'M2.5 7.25H13.5V14.5H2.5ZM5 7.25V5a3 3 0 0 1 6 0V7.25M5.25 10.875h0M8 10.875h0M10.75 10.875h0',
  // a page with its corner folded down, written on
  notes:
    'M3.25 1.5H9.75L12.75 4.5V14.5H3.25ZM9.75 1.5V4.5H12.75M5.75 7H10.25M5.75 9.5H10.25M5.75 12H8.5'
};

export const categoryIcon = (id: string): string | undefined => icons[id];
