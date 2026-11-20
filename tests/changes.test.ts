import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildChangelog, gitIn, readChangelog, stringify, type Git } from '#lib/data/changes.ts';
import type { Changelog, LogEntry } from '#lib/data/types.ts';

const fixture = (name: string) =>
  readFileSync(`tests/fixtures/data/services/notes/${name}`, 'utf8');
const jotter = fixture('jotter.yml');

// kept well away from this machine's own git config, hooks and signing
const env = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'Test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'Test',
  GIT_COMMITTER_EMAIL: 'test@example.com'
};

let scratch: string;
let repo: string;
let git: Git;
let sideCommit: string;
let secondCommit: string;

const run = (...args: string[]) =>
  execFileSync('git', args, { cwd: repo, env, encoding: 'utf8' }).trim();
const write = (file: string, text: string) => {
  mkdirSync(dirname(join(repo, file)), { recursive: true });
  writeFileSync(join(repo, file), text);
};
const commit = (date: string, subject: string) => {
  run('add', '-A');
  const at = `${date}T12:00:00Z`;
  execFileSync('git', ['commit', '-q', '-m', subject], {
    cwd: repo,
    env: { ...env, GIT_AUTHOR_DATE: at, GIT_COMMITTER_DATE: at }
  });
  return run('rev-parse', 'HEAD');
};

beforeAll(() => {
  scratch = mkdtempSync(join(tmpdir(), 'exitformat-changelog-'));
  repo = join(scratch, 'repo');
  mkdirSync(repo);
  git = gitIn(repo);
  run('init', '-q', '-b', 'main');

  write('data/services/notes/jotter.yml', jotter);
  write('data/services/notes/quill.yml', fixture('quill.yml'));
  write('data/formats/markdown.yml', 'name: Markdown\n');
  const first = commit('2026-11-01', 'feat(data): add Jotter and Quill (#1)');

  const refreshed = jotter
    .replace('Copy it somewhere else.', 'Copy it to a USB stick.')
    .replace('2026-11-15', '2026-11-19');
  write('data/services/notes/jotter.yml', refreshed);
  secondCommit = commit('2026-11-02', 'fix(data): refresh Jotter (#2)');

  const tidied = refreshed
    .replace(
      '    method: folder\n    formats: [markdown]',
      '    formats: [markdown]\n    method: folder'
    )
    .replace(/\n/g, '\n\n');
  write('data/services/notes/jotter.yml', `# tidied up\n${tidied}`);
  commit('2026-11-03', 'style(data): tidy Jotter (#3)');

  mkdirSync(join(repo, 'data/services/docs'));
  run('mv', 'data/services/notes/quill.yml', 'data/services/docs/quill.yml');
  commit('2026-11-04', 'refactor(data): move Quill to docs');

  rmSync(join(repo, 'data/services/notes/jotter.yml'));
  commit('2026-11-05', 'feat(data): take Jotter out (#5)');

  // what a branch that later gets squashed leaves behind
  run('switch', '-q', '-c', 'side', first);
  write('data/services/notes/scribble.yml', fixture('scribble.yml'));
  sideCommit = commit('2026-11-06', 'feat(data): add Scribble');
  run('switch', '-q', 'main');
});

afterAll(() => rmSync(scratch, { recursive: true, force: true }));

const empty: Changelog = { commit: '', entries: [] };
const withoutCommits = (entries: LogEntry[]) => entries.map(({ commit, ...entry }) => entry);

describe('changelog', () => {
  it('logs every service added, updated, moved and taken out, newest first', () => {
    const { log, resumed } = buildChangelog(git, empty);
    expect(resumed).toBe(false);
    expect(withoutCommits(log.entries)).toEqual([
      {
        date: '2026-11-05',
        pr: 5,
        id: 'jotter',
        category: 'notes',
        name: 'Jotter',
        kind: 'removed'
      },
      {
        date: '2026-11-04',
        id: 'quill',
        category: 'docs',
        name: 'Quill',
        kind: 'updated',
        sections: ['details']
      },
      {
        date: '2026-11-02',
        pr: 2,
        id: 'jotter',
        category: 'notes',
        name: 'Jotter',
        kind: 'updated',
        sections: ['export', 'verification']
      },
      { date: '2026-11-01', pr: 1, id: 'jotter', category: 'notes', name: 'Jotter', kind: 'added' },
      { date: '2026-11-01', pr: 1, id: 'quill', category: 'notes', name: 'Quill', kind: 'added' }
    ]);
    expect(log.commit).toBe(run('rev-parse', 'HEAD'));
  });

  it('picks up from its pointer and keeps what it already had', () => {
    const kept = { date: '2026-10-01', commit: 'abcdef0', id: 'kept', category: 'notes' };
    const saved: Changelog = {
      commit: secondCommit,
      entries: [{ ...kept, name: 'Kept from last time', kind: 'added' }]
    };
    const { log, fresh, resumed } = buildChangelog(git, saved);
    expect([resumed, fresh]).toEqual([true, 2]);
    expect(log.entries.map(({ name, kind }) => `${name} ${kind}`)).toEqual([
      'Jotter removed',
      'Quill updated',
      'Kept from last time added'
    ]);
  });

  it('rebuilds in full when its pointer is a commit main never had', () => {
    const saved: Changelog = { commit: sideCommit, entries: [] };
    const { log, resumed } = buildChangelog(git, saved);
    expect(resumed).toBe(false);
    expect(log.entries).toEqual(buildChangelog(git, empty).log.entries);
  });

  it('refuses a shallow clone rather than wipe the history', () => {
    const shallow = join(scratch, 'shallow');
    execFileSync('git', ['clone', '-q', '--depth', '1', `file://${repo}`, shallow], { env });
    expect(() => buildChangelog(gitIn(shallow), empty)).toThrow(/fetch all of it/);
  });

  it('reads a missing or blank file as an empty log', () => {
    const blank = join(scratch, 'blank.json');
    writeFileSync(blank, '\n');
    expect(readChangelog(join(scratch, 'missing.json'))).toEqual(empty);
    expect(readChangelog(blank)).toEqual(empty);
  });

  it('writes a log it can read back, with or without entries', () => {
    const file = join(scratch, 'changelog.json');
    for (const log of [empty, buildChangelog(git, empty).log]) {
      writeFileSync(file, stringify(log));
      expect(readChangelog(file)).toEqual(log);
    }
  });
});
