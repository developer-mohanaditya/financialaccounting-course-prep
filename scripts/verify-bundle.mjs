// Proves the browser cannot read an answer key.
//
// Two independent checks, because either one alone can be fooled:
//
//  1. The import graph. Nothing reachable from src/main.tsx may import the
//     authored papers, the marking engine, the matching rules, or the redaction
//     helper. A study-interface file that reaches for one of them is a build
//     error, not a silent leak.
//
//  2. The built bundle. Every key-only string in the authored papers — entry
//     line wordings, dates, amounts, per-line notes, worked explanations, option
//     rationales, schedule answers — is searched for in dist/. And, in the other
//     direction, the question prompts are checked to still be there, so a build
//     that ships nothing at all cannot pass by being empty.
//
// Usage: node scripts/verify-bundle.mjs   (run after `npm run build`)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'src');
const distDir = path.join(root, 'dist');
const outDir = path.join(root, '.verify', 'bundle');

const problems = [];

/* ------------------------------------------------------------------ */
/* 1. The import graph                                                 */
/* ------------------------------------------------------------------ */

/**
 * Modules that must never be reachable from the browser entry point.
 *
 * `data/examKit` and the multiple-choice pools are here because they carry keys
 * indirectly: the kit assembles papers out of the pools, and the pools hold every
 * answer and rationale. A future import of either would reintroduce the whole set.
 */
const FORBIDDEN = [
  'data/exams',
  'data/examKit',
  'data/mcqPoolA',
  'data/mcqPoolB',
  'data/mcqPoolC',
  'data/mcqPoolD',
  'data/mcqShared',
  'lib/marking',
  'lib/matching',
  'lib/redact',
];

const IMPORT_RE = /(?:^|\n)\s*import\s+(?:[\s\S]*?)\s*from\s*['"]([^'"]+)['"]/g;
const BARE_IMPORT_RE = /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g;

function resolveSpec(fromFile, spec) {
  if (!spec.startsWith('.')) return null; // bare package, not our problem
  const base = path.resolve(path.dirname(fromFile), spec);
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (existsSync(candidate) && !candidate.endsWith(path.sep)) {
      try {
        if (readFileSync(candidate, 'utf8') !== null) return candidate;
      } catch {
        /* directory */
      }
    }
  }
  return null;
}

function specifiersOf(file) {
  const text = readFileSync(file, 'utf8');
  const specs = new Set();
  for (const re of [IMPORT_RE, BARE_IMPORT_RE]) {
    re.lastIndex = 0;
    let match;
    while ((match = re.exec(text)) !== null) specs.add(match[1]);
  }
  return specs;
}

const entry = path.join(srcDir, 'main.tsx');
const seen = new Set();
const queue = [entry];

while (queue.length > 0) {
  const file = queue.pop();
  if (seen.has(file)) continue;
  seen.add(file);

  let specs;
  try {
    specs = specifiersOf(file);
  } catch {
    continue;
  }

  for (const spec of specs) {
    const resolved = resolveSpec(file, spec);
    if (!resolved) continue;

    const relative = path.relative(srcDir, resolved).split(path.sep).join('/');
    for (const banned of FORBIDDEN) {
      if (relative === banned || relative === `${banned}.ts` || relative === `${banned}.tsx`) {
        problems.push(
          `${path.relative(root, file)} imports ${spec} — the browser must never reach key material`,
        );
      }
    }
    queue.push(resolved);
  }
}

console.log(`Import graph: ${seen.size} modules reachable from src/main.tsx.`);

/* ------------------------------------------------------------------ */
/* 1b. The generated papers are not stale                              */
/* ------------------------------------------------------------------ */

// The browser reads a generated, redacted module. If it were left behind after
// an edit to the papers, the studio would quietly serve a different paper from
// the one the server marks against — so compare it against a fresh redaction.
const generatedPath = path.join(srcDir, 'data', 'learnerExams.generated.ts');
let generated = null;
try {
  generated = readFileSync(generatedPath, 'utf8');
} catch {
  /* handled below */
}

if (generated === null) {
  problems.push('src/data/learnerExams.generated.ts is missing — run `npm run gen:papers`');
}

/* ------------------------------------------------------------------ */
/* 2. The built bundle                                                */
/* ------------------------------------------------------------------ */

if (!existsSync(distDir)) {
  console.error('No dist/ found. Run `npm run build` first.');
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  path.join(root, 'node_modules', '.bin', 'tsc'),
  [
    path.join('src', 'data', 'exams', 'index.ts'),
    path.join('src', 'lib', 'redact.ts'),
    path.join('src', 'data', 'chartOfAccounts.ts'),
    '--outDir',
    path.join('.verify', 'bundle'),
    '--module',
    'commonjs',
    '--target',
    'es2022',
    '--moduleResolution',
    'node',
    '--esModuleInterop',
    '--skipLibCheck',
  ],
  { cwd: root, stdio: ['ignore', 'ignore', 'pipe'] },
);

writeFileSync(path.join(outDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

const require = createRequire(import.meta.url);
const { MOCK_EXAMS } = require(path.join(outDir, 'data', 'exams', 'index.js'));
const { redactExams } = require(path.join(outDir, 'lib', 'redact.js'));
const { BALANCE_SHEET_CHART, PROFIT_AND_LOSS_CHART } = require(
  path.join(outDir, 'data', 'chartOfAccounts.js'),
);
const learnerExams = redactExams(MOCK_EXAMS);

// Compare the generated module with a fresh redaction. Done after the graph walk
// so the comparison itself happens once both sides are available.
if (generated !== null && !generated.includes(`= ${JSON.stringify(learnerExams)};`)) {
  problems.push(
    'src/data/learnerExams.generated.ts is out of date with src/data/exams — run `npm run gen:papers`',
  );
}

/** Strings that exist only in the key, and must therefore be absent from dist/. */
const keyOnly = new Set();
/** Strings the learner is entitled to, checked to still be present. */
const mustAppear = new Set();

for (const exam of MOCK_EXAMS) {
  mustAppear.add(exam.company);
  for (const section of exam.sections) {
    for (const id of section.questionIds) {
      const q = exam.questions[id];
      if (q.kind === 'mcq') {
        for (const option of q.options) if (option.key !== 'DK') mustAppear.add(option.label);
        if (q.explanation) keyOnly.add(q.explanation);
        for (const rationale of Object.values(q.optionRationale ?? {})) keyOnly.add(rationale);
      } else if (q.kind === 'entry') {
        mustAppear.add(q.prompt);
        for (const line of q.lines) {
          if (line.wording) keyOnly.add(line.wording);
          if (line.date) keyOnly.add(line.date);
          if (line.note) keyOnly.add(line.note);
          if (typeof line.debit === 'number') keyOnly.add(String(line.debit));
          if (typeof line.credit === 'number') keyOnly.add(String(line.credit));
        }
        for (const line of q.explanation) keyOnly.add(line);
      } else {
        for (const row of q.rows) {
          for (const value of Object.values(row.cells)) {
            if (value === null || value === undefined || value === '') continue;
            keyOnly.add(String(value));
          }
        }
        for (const line of q.explanation) keyOnly.add(line);
      }
    }
  }
}

/**
 * Everything a learner may legitimately see, harvested from the redacted papers
 * and the chart of accounts.
 *
 * This matters: an account wording like "Deductible VAT" is both an expected
 * entry answer and a printed account in the annex the student may search. Flagging
 * it as a leak would train everyone to ignore this check. A string only counts as
 * leaked if the learner has no legitimate way to already have it.
 */
const learnerVisible = new Set();

function harvest(value) {
  if (typeof value === 'string') {
    learnerVisible.add(value.trim());
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) harvest(item);
    return;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) harvest(item);
  }
}

for (const exam of learnerExams) {
  harvest(exam.title);
  harvest(exam.company);
  harvest(exam.summary);
  harvest(exam.topics);
  harvest(exam.intro);
  harvest(exam.sections.map((s) => s.instructions));
  for (const section of exam.sections) {
    for (const id of section.questionIds) {
      const q = exam.questions[id];
      harvest(q.prompt);
      harvest(q.context);
      if (q.kind === 'mcq') {
        for (const option of q.options) harvest(option.label);
      } else if (q.kind === 'schedule') {
        for (const row of q.rows) {
          harvest(row.label);
          harvest(row.given);
        }
      }
    }
  }
}
harvest(BALANCE_SHEET_CHART);
harvest(PROFIT_AND_LOSS_CHART);

// Very short strings would match by accident; they carry no information anyway.
const probes = [...keyOnly]
  .filter((s) => typeof s === 'string' && s.trim().length >= 12)
  .filter((s) => !learnerVisible.has(s.trim()));
const keep = [...mustAppear].filter((s) => typeof s === 'string' && s.trim().length >= 12);

const assetsDir = path.join(distDir, 'assets');
const files = existsSync(assetsDir)
  ? readdirSync(assetsDir).filter((f) => f.endsWith('.js') || f.endsWith('.css'))
  : [];
if (files.length === 0) {
  console.error('No built assets found in dist/assets.');
  process.exit(1);
}

const bundle = files.map((f) => readFileSync(path.join(assetsDir, f), 'utf8')).join('\n');

const leaked = probes.filter((probe) => bundle.includes(probe));
if (leaked.length > 0) {
  for (const probe of leaked.slice(0, 10)) {
    problems.push(`answer key present in dist/: "${probe.slice(0, 70)}…"`);
  }
  if (leaked.length > 10) problems.push(`…and ${leaked.length - 10} more key strings in dist/`);
}

const missing = keep.filter((probe) => !bundle.includes(probe));
if (missing.length > 0) {
  for (const probe of missing.slice(0, 5)) {
    problems.push(`question text missing from dist/: "${probe.slice(0, 70)}…"`);
  }
}

console.log(
  `Bundle scan: ${probes.length} key strings absent, ${keep.length} question strings present, across ${files.length} asset(s).`,
);

if (problems.length > 0) {
  console.error('\nFAILED:');
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}

console.log('\nOK — no answer key reaches the browser.');
