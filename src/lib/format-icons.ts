// Each open format's mark: its own logo where we're free to use one, or a drawing on Icon's grid
export interface FormatMark {
  /** the width and height of the box the path's drawn in */
  size: number;
  d: string;
  /** a logo is a filled shape, where a drawing is a line */
  filled?: boolean;
}

const marks = {
  // Dustin Curtis's Markdown mark, CC0, from github.com/dcurtis/markdown-mark via simpleicons.org
  markdown: {
    size: 24,
    filled: true,
    d: 'M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z'
  },
  // the JSON logo, from commons.wikimedia.org/wiki/File:JSON_vector_logo.svg via simpleicons.org
  json: {
    size: 24,
    filled: true,
    d: 'M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 003.146-.863 12.404 12.404 0 003.793-2.542 11.977 11.977 0 002.44-3.427 11.794 11.794 0 001.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 00-.793-2.788 11.197 11.197 0 00-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 00-2.172-.87h-.005c.119.063.24.132.345.201.12.074.239.146.351.225a8.93 8.93 0 011.559 1.33c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 01-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a3.916 3.916 0 01-.748-.258 4.692 4.692 0 01-.779-.45 6.08 6.08 0 01-1.244-1.105 6.507 6.507 0 01-1.049-1.747 7.366 7.366 0 01-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 011.663-1.918c.225-.178.464-.333.704-.479l.016-.007a5.121 5.121 0 00-1.441-.12 4.963 4.963 0 00-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 00-.733.494c-.211.18-.42.36-.615.555-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 001.348 2.173 8.14 8.14 0 003.132 2.23 7.934 7.934 0 002.113.54c.074.015.149.015.209.015zm-2.934-.398a4.102 4.102 0 01-.45-.228 8.5 8.5 0 01-2.038-1.534c-1.094-1.137-1.827-2.566-2.247-4.08a15.184 15.184 0 01-.495-3.172 12.14 12.14 0 01.046-2.082c.135-1.257.495-2.501 1.124-3.58a6.889 6.889 0 011.783-2.053 6.23 6.23 0 011.633-.9 5.363 5.363 0 013.522-.045c.029 0 .029 0 .045.03.015.015.045.015.06.03.045.016.104.045.165.074.239.12.479.271.704.42a6.294 6.294 0 012.097 2.502c.42.914.615 1.934.631 2.938.014 1.079-.18 2.157-.645 3.146a6.42 6.42 0 01-2.638 2.832c.09.03.18.045.271.075.225.044.449.074.688.074 1.468.045 2.892-.66 3.94-1.647.195-.18.375-.375.54-.585.225-.27.435-.54.614-.823.239-.375.435-.75.614-1.154a8.112 8.112 0 00.509-1.664c.196-1.004.211-2.022.149-3.026-.135-2.022-.673-4.045-1.842-5.724a9.054 9.054 0 00-.555-.719 9.868 9.868 0 00-1.063-1.034 8.477 8.477 0 00-1.363-.915 9.927 9.927 0 00-1.692-.598l-.3-.06c-.209-.03-.42-.044-.634-.06a8.453 8.453 0 00-1.015.016c-.704.045-1.412.16-2.112.337C5.799 1.227 2.863 3.566 1.3 6.67A11.834 11.834 0 00.238 9.801a11.81 11.81 0 00-.104 3.775c.12 1.02.374 2.023.778 2.977.227.57.511 1.124.825 1.648 1.094 1.783 2.683 3.236 4.51 4.24.688.39 1.408.69 2.157.944.226.074.45.15.689.21z'
  },
  // the W3C's HTML5 logo, CC BY 3.0, from w3.org/html/logo via simpleicons.org
  html: {
    size: 24,
    filled: true,
    d: 'M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z'
  },
  // JSON Canvas's own mark, MIT licensed, © 2024 Obsidian.md, from github.com/obsidianmd/jsoncanvas
  canvas: {
    size: 60,
    filled: true,
    d: 'M5 0H55A5 5 0 0 1 60 5V55A5 5 0 0 1 55 60H5A5 5 0 0 1 0 55V5A5 5 0 0 1 5 0ZM9.23 43.85a8.46 8.46 0 1 0 16.92 0a8.46 8.46 0 1 0-16.92 0ZM35.38 17.69a8.46 8.46 0 1 0 16.92 0a8.46 8.46 0 1 0-16.92 0ZM47.69 33.94A13.75 13.75 0 0 1 33.94 47.69H30.77V41.35H33.94A7.41 7.41 0 0 0 41.35 33.94V30.77H47.69Z'
  },
  // a grid, with a column of row names down the side
  table: {
    size: 16,
    d: 'M1.75 2.75H14.25V13.25H1.75ZM1.75 6.25H14.25M1.75 9.75H14.25M6 2.75V13.25'
  },
  // lines of words, the last one running short
  text: { size: 16, d: 'M2 3.5H14M2 6.5H14M2 9.5H14M2 12.5H9' },
  // a tag's angle brackets
  markup: { size: 16, d: 'M5 4.5 1.5 8 5 11.5M11 4.5 14.5 8 11 11.5M9.25 3 6.75 13' },
  // a page with its corner folded down
  document: { size: 16, d: 'M3.25 1.5H9.75L12.75 4.5V14.5H3.25ZM9.75 1.5V4.5H12.75' },
  // a book lying open
  book: {
    size: 16,
    d: 'M8 4.25C6.5 3 4.5 2.5 1.5 2.5V12.5C4.5 12.5 6.5 13 8 14.25C9.5 13 11.5 12.5 14.5 12.5V2.5C11.5 2.5 9.5 3 8 4.25ZM8 4.25V14.25'
  },
  // a list with the last two items tucked in under the first
  outline: { size: 16, d: 'M2.5 3.5h0M5.5 3.5H14M5.5 8h0M8.5 8H14M5.5 12.5h0M8.5 12.5H14' },
  // a box with its lid on
  archive: { size: 16, d: 'M1.5 2.25H14.5V5.25H1.5ZM2.5 5.25V13.75H13.5V5.25M6.25 8.25H9.75' },
  // a padlock, shut, for files that are a whole vault
  lock: {
    size: 16,
    d: 'M3.25 7.25H12.75V14.25H3.25ZM5.25 7.25V5a2.75 2.75 0 0 1 5.5 0V7.25M8 10V11.5'
  }
} satisfies Record<string, FormatMark>;

export type MarkName = keyof typeof marks;

// Word, Excel and PDF only have Microsoft's and Adobe's app icons, and EPUB's logo is a trademark
const kinds: Record<string, MarkName> = {
  '.md': 'markdown',
  '.markdown': 'markdown',
  '.json': 'json',
  '.html': 'html',
  '.htm': 'html',
  '.canvas': 'canvas',
  '.csv': 'table',
  '.tsv': 'table',
  '.xlsx': 'table',
  '.ods': 'table',
  '.txt': 'text',
  '.xml': 'markup',
  '.pdf': 'document',
  '.docx': 'document',
  '.epub': 'book',
  '.opml': 'outline',
  '.zip': 'archive',
  '.textbundle': 'archive',
  '.textpack': 'archive',
  '.kdbx': 'lock'
};

/** The mark for the first of a format's extensions that has one */
export const markFor = (extensions: string[]): MarkName | null =>
  extensions.map((extension) => kinds[extension]).find(Boolean) ?? null;

export const formatMark = (name: MarkName): FormatMark => marks[name];

/** A logo runs to the edges of its box where a drawing doesn't, so a logo gets room round it */
export function viewBox({ size, filled }: FormatMark) {
  const room = filled ? size / 12 : 0;
  return [-room, -room, size + 2 * room, size + 2 * room].join(' ');
}
