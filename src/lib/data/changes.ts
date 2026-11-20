import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { parse } from 'yaml';
import {
  changeSections,
  type ChangeSection,
  type Changelog,
  type LogEntry
} from '#lib/data/types.ts';

export type Git = (...args: string[]) => string;
type Version = Record<string, unknown> & { name: string; category: string };

export const changelogFile = '.github/changelog.json';
const servicePath = /^data\/services\/([^/]+)\/([^/]+)\.yml$/;

export const gitIn =
  (cwd: string): Git =>
  (...args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1e8, stdio: 'pipe' }).trim();

export function readChangelog(file: string): Changelog {
  const text = existsSync(file) ? readFileSync(file, 'utf8').trim() : '';
  return text ? JSON.parse(text) : { commit: '', entries: [] };
}

/** One entry a line, so each new change is a one-line diff */
export function stringify({ commit, entries }: Changelog) {
  const lines = entries.map((entry) => `    ${JSON.stringify(entry)}`).join(',\n');
  return `{\n  "commit": "${commit}",\n  "entries": [${lines && `\n${lines}\n  `}]\n}\n`;
}

// keys in order, so shuffling fields round a file isn't a change
const stable = (value: unknown) =>
  JSON.stringify(value, (_, inner) =>
    inner && typeof inner === 'object' && !Array.isArray(inner)
      ? Object.fromEntries(Object.entries(inner).sort(([a], [b]) => a.localeCompare(b)))
      : inner
  );

const sectionOf = (key: string) =>
  (Object.hasOwn(changeSections, key) ? key : 'details') as ChangeSection;

/** What happened to a service between two versions of its file, if any of it shows */
export function diff(before?: Version, after?: Version) {
  if (!before) return { kind: 'added' } as const;
  if (!after) return { kind: 'removed' } as const;
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const touched = new Set(
    [...keys].filter((key) => stable(before[key]) !== stable(after[key])).map(sectionOf)
  );
  if (!touched.size) return;
  const sections = (Object.keys(changeSections) as ChangeSection[]).filter((section) =>
    touched.has(section)
  );
  return { kind: 'updated', sections } as const;
}

/** The saved log plus everything since its pointer, or rebuilt in full if it's lost its place */
export function buildChangelog(git: Git, saved: Changelog) {
  // a shallow clone would rebuild from one commit and wipe the rest
  if (git('rev-parse', '--is-shallow-repository') === 'true')
    throw new Error('The changelog is built from git history, so fetch all of it first');

  const succeeds = (...args: string[]) => {
    try {
      git(...args);
      return true;
    } catch {
      return false;
    }
  };
  const resumed =
    Boolean(saved.commit) && succeeds('merge-base', '--is-ancestor', saved.commit, 'HEAD');
  const head = git('rev-parse', 'HEAD');
  const emptyTree = git('hash-object', '-t', 'tree', '/dev/null');
  const versionAt = (rev: string, file: string, category: string): Version => ({
    ...parse(git('show', `${rev}:${file}`)),
    category
  });

  const commits = git(
    'log',
    '--first-parent',
    '--format=%H%x09%P%x09%cs%x09%s',
    resumed ? `${saved.commit}..HEAD` : 'HEAD',
    '--',
    'data/services'
  );

  const fresh = commits
    .split('\n')
    .filter(Boolean)
    .flatMap((line): LogEntry[] => {
      const [sha, parents, date, subject] = line.split('\t');
      const [parent] = parents.split(' ');
      const pr = subject.match(/\(#(\d+)\)$/)?.[1];
      const files = git(
        'diff-tree',
        '-r',
        '--no-renames',
        '--name-status',
        parent || emptyTree,
        sha,
        '--',
        'data/services'
      );

      // a file moving category is one service changing, not one going and another arriving
      const sides = new Map<string, { before?: Version; after?: Version }>();
      for (const [status, file] of files.split('\n').map((row) => row.split('\t'))) {
        const [, category, id] = file?.match(servicePath) ?? [];
        if (!id) continue;
        const side = sides.get(id) ?? {};
        if (status !== 'A') side.before = versionAt(parent, file, category);
        if (status !== 'D') side.after = versionAt(sha, file, category);
        sides.set(id, side);
      }

      return [...sides]
        .flatMap(([id, { before, after }]) => {
          const change = diff(before, after);
          if (!change) return [];
          const { name, category } = (after ?? before)!;
          const link = { commit: sha.slice(0, 7), ...(pr ? { pr: Number(pr) } : {}) };
          return [{ date, ...link, id, category, name, ...change }];
        })
        .sort((a, b) => a.name.localeCompare(b.name));
    });

  return {
    log: { commit: head, entries: [...fresh, ...(resumed ? saved.entries : [])] },
    fresh: fresh.length,
    resumed
  };
}
