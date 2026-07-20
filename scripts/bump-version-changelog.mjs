#!/usr/bin/env node
/**
 * Bumps patch version (root + apps/web) and appends a Keep a Changelog entry
 * from the commit message. Invoked by .husky/prepare-commit-msg.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const commitMsgFile = process.argv[2];
const source = process.argv[3] ?? '';

const SKIP_SOURCES = new Set(['merge', 'squash', 'commit']);

if (SKIP_SOURCES.has(source) || process.env.SKIP_VERSION_BUMP === '1') {
  process.exit(0);
}

if (!commitMsgFile) {
  console.error('bump-version-changelog: missing commit message file path');
  process.exit(1);
}

const msgContent = readFileSync(commitMsgFile, 'utf8');
const firstLine = msgContent
  .split(/\r?\n/)
  .map((line) => line.trim())
  .find((line) => line.length > 0 && !line.startsWith('#'));

if (!firstLine || firstLine.startsWith('Merge ')) {
  process.exit(0);
}

const CONVENTIONAL_COMMIT =
  /^(\w+)(?:\([^)]+\))?!?:\s*(.+)$/;
const match = firstLine.match(CONVENTIONAL_COMMIT);
const type = match?.[1]?.toLowerCase() ?? 'chore';
const subject = (match?.[2] ?? firstLine).trim();

const TYPE_TO_SECTION = {
  feat: 'Added',
  fix: 'Fixed',
  perf: 'Changed',
  refactor: 'Changed',
  docs: 'Changed',
  chore: 'Changed',
  build: 'Changed',
  ci: 'Changed',
  test: 'Changed',
  style: 'Changed',
  revert: 'Fixed',
};

const section = TYPE_TO_SECTION[type] ?? 'Changed';

function readJson(relativePath) {
  const absolutePath = join(root, relativePath);
  return {
    absolutePath,
    data: JSON.parse(readFileSync(absolutePath, 'utf8')),
  };
}

function writeJson(file, data) {
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

const rootPkg = readJson('package.json');
const webPkg = readJson('apps/web/package.json');

if (rootPkg.data.version !== webPkg.data.version) {
  console.warn(
    `bump-version-changelog: syncing mismatched versions (${rootPkg.data.version} vs ${webPkg.data.version})`,
  );
}

const versionParts = rootPkg.data.version.split('.').map(Number);
if (versionParts.length !== 3 || versionParts.some(Number.isNaN)) {
  console.error(
    `bump-version-changelog: invalid semver ${rootPkg.data.version}`,
  );
  process.exit(1);
}

const newVersion = `${versionParts[0]}.${versionParts[1]}.${versionParts[2] + 1}`;
rootPkg.data.version = newVersion;
webPkg.data.version = newVersion;

writeJson(rootPkg.absolutePath, rootPkg.data);
writeJson(webPkg.absolutePath, webPkg.data);

const changelogPath = join(root, 'CHANGELOG.md');
let changelog = readFileSync(changelogPath, 'utf8');
const today = new Date().toISOString().slice(0, 10);
const versionHeader = `## [${newVersion}] - ${today}`;
const bullet = `- ${subject}`;

if (changelog.includes(versionHeader)) {
  const sectionHeader = `### ${section}`;
  const versionIndex = changelog.indexOf(versionHeader);
  const afterVersion = changelog.slice(versionIndex + versionHeader.length);
  const sectionIndex = afterVersion.indexOf(sectionHeader);

  if (sectionIndex !== -1) {
    const insertAt =
      versionIndex +
      versionHeader.length +
      sectionIndex +
      sectionHeader.length;
    const rest = changelog.slice(insertAt);
    const lineBreak = rest.startsWith('\r\n') ? '\r\n' : '\n';
    changelog =
      changelog.slice(0, insertAt) +
      `${lineBreak}${lineBreak}${bullet}` +
      changelog.slice(insertAt);
  } else {
    const nextHeader = changelog.indexOf('\n## ', versionIndex + 1);
    const insertAt = nextHeader === -1 ? changelog.length : nextHeader;
    const block = `\n\n### ${section}\n\n${bullet}`;
    changelog =
      changelog.slice(0, insertAt) + block + changelog.slice(insertAt);
  }
} else {
  const unreleasedHeader = '## [Unreleased]';
  const unreleasedIndex = changelog.indexOf(unreleasedHeader);
  if (unreleasedIndex === -1) {
    console.error('bump-version-changelog: CHANGELOG.md missing [Unreleased]');
    process.exit(1);
  }

  const afterUnreleased = changelog.slice(
    unreleasedIndex + unreleasedHeader.length,
  );
  const nextRelease = afterUnreleased.search(/\r?\n## \[\d/);
  const insertAt =
    nextRelease === -1
      ? changelog.length
      : unreleasedIndex + unreleasedHeader.length + nextRelease;

  const block = `\n\n## [${newVersion}] - ${today}\n\n### ${section}\n\n${bullet}\n`;
  changelog =
    changelog.slice(0, insertAt) + block + changelog.slice(insertAt);
}

writeFileSync(changelogPath, changelog, 'utf8');

execFileSync(
  'git',
  ['add', 'package.json', 'apps/web/package.json', 'CHANGELOG.md'],
  { cwd: root, stdio: 'inherit' },
);

console.log(
  `bump-version-changelog: ${newVersion} — ${section}: ${subject}`,
);
