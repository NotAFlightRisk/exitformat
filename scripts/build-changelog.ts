import { writeFileSync } from 'node:fs';
import {
  buildChangelog,
  changelogFile,
  gitIn,
  readChangelog,
  stringify
} from '#lib/data/changes.ts';

const { log, fresh, resumed } = buildChangelog(gitIn('.'), readChangelog(changelogFile));
if (fresh || !resumed) writeFileSync(changelogFile, stringify(log));
console.log(`${fresh} new changes, ${log.entries.length} in ${changelogFile}`);
