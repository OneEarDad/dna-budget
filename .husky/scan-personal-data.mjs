// Pre-commit personal-data scan.
// Per SECURITY.md and DNA_BUDGET_SPEC.md §12.
//
// To bypass (rarely, with intent): git commit --no-verify

import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const REPO_ROOT = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const NAMES_FILE = join(REPO_ROOT, '.husky/personal-names.txt');

const RED = '\x1b[0;31m';
const YELLOW = '\x1b[0;33m';
const GREEN = '\x1b[0;32m';
const BOLD = '\x1b[1m';
const NC = '\x1b[0m';

const violations = [];

function block(kind, file, match, fix) {
  violations.push({ kind, file, match, fix });
  console.log(`${RED}${BOLD}❌ BLOCKED${NC}: ${kind}`);
  console.log(`   ${YELLOW}File:${NC}  ${file}`);
  if (match) console.log(`   ${YELLOW}Match:${NC} ${match}`);
  console.log(`   ${YELLOW}Fix:${NC}   ${fix}`);
  console.log('');
}

function getStagedFiles() {
  return execSync('git diff --cached --name-only --diff-filter=ACMR', { encoding: 'utf8' })
    .split('\n')
    .filter(Boolean);
}

function getStagedContent(file) {
  try {
    return execSync(`git show ":${file}"`, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

function loadNames() {
  if (!existsSync(NAMES_FILE)) return null;
  return readFileSync(NAMES_FILE, 'utf8')
    .split('\n')
    .map((line) => line.replace(/\r$/, '').trim())
    .filter((line) => line && !line.startsWith('#'));
}

const stagedFiles = getStagedFiles();
if (stagedFiles.length === 0) process.exit(0);

// Pattern 1: Filename matches privacy-sensitive patterns
const privacyFilenameRe = /^DNA_BUDGET_SPEC\.md$|\.private(\.|$)/;
for (const file of stagedFiles) {
  if (privacyFilenameRe.test(file)) {
    block(
      'filename matches privacy pattern',
      file,
      '',
      'Add to .gitignore, or rename the file'
    );
  }
}

// Pattern 2: Real first names (config-driven, gitignored config)
const names = loadNames();
if (names) {
  for (const name of names) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[^A-Za-z0-9])${escaped}([^A-Za-z0-9]|$)`);
    for (const file of stagedFiles) {
      if (file === '.husky/personal-names.txt') continue;
      if (re.test(getStagedContent(file))) {
        block(
          'contains personal name',
          file,
          name,
          'Replace with a placeholder, use settings.userNames at runtime, or remove before committing'
        );
      }
    }
  }
} else {
  console.log(`${YELLOW}⚠️  Warning${NC}: ${NAMES_FILE} not found; personal-name check skipped.`);
  console.log('   To enable on a fresh clone: cp .husky/personal-names.example.txt .husky/personal-names.txt');
  console.log('   Then edit the copy with your household real names.');
  console.log('');
}

// Pattern 3: Dollar amounts in src/data/ outside defaults.example.ts
for (const file of stagedFiles) {
  if (!file.startsWith('src/data/')) continue;
  if (file === 'src/data/defaults.example.ts') continue;
  const lines = getStagedContent(file).split('\n');
  const dollarRe = /\$[0-9]+|budget:\s*[1-9]|amount:\s*[1-9]/;
  const matches = [];
  for (let i = 0; i < lines.length && matches.length < 3; i++) {
    if (dollarRe.test(lines[i])) {
      matches.push(`L${i + 1}: ${lines[i].trim().slice(0, 80)}`);
    }
  }
  if (matches.length > 0) {
    block(
      'dollar amount in src/data/ outside defaults.example.ts',
      file,
      matches.join('\n          '),
      'Real budgets live in src/data/defaults.ts (gitignored). The committed defaults.example.ts must keep budget: 0 placeholders only.'
    );
  }
}

// Pattern 4: SSN-format numbers (xxx-xx-xxxx)
const ssnRe = /(?:^|[^0-9])[0-9]{3}-[0-9]{2}-[0-9]{4}(?:[^0-9]|$)/;
for (const file of stagedFiles) {
  if (ssnRe.test(getStagedContent(file))) {
    block(
      'looks like an SSN',
      file,
      '',
      'Remove or redact the SSN-format number (xxx-xx-xxxx)'
    );
  }
}

// Final report
if (violations.length > 0) {
  console.log(`${RED}${BOLD}Commit blocked.${NC} ${violations.length} violation(s) found.`);
  console.log(`Override sparingly: ${BOLD}git commit --no-verify${NC}`);
  process.exit(1);
}

console.log(`${GREEN}✓${NC} Personal-data scan passed.`);
process.exit(0);
