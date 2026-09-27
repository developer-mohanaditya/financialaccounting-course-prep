// Generates the learner-facing paper module.
//
// The authored papers under src/data/exams carry the answer keys. The study
// interface must never import them, so this script redacts them and writes the
// result to src/data/learnerExams.generated.ts, which is the only exam module
// the browser bundle is allowed to reach.
//
// Usage: node scripts/build-learner-papers.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.verify', 'gen');
const target = path.join(root, 'src', 'data', 'learnerExams.generated.ts');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  path.join(root, 'node_modules', '.bin', 'tsc'),
  [
    path.join('src', 'data', 'exams', 'index.ts'),
    path.join('src', 'lib', 'redact.ts'),
    '--outDir',
    path.join('.verify', 'gen'),
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
const { redactExams, findLeakedKeys } = require(path.join(outDir, 'lib', 'redact.js'));

const learnerExams = redactExams(MOCK_EXAMS);

// Fail the build rather than ship a paper that still carries key material.
const leaks = learnerExams.flatMap((exam) => findLeakedKeys(exam).map((leak) => `${exam.id}: ${leak}`));
if (leaks.length > 0) {
  console.error('Refusing to write learner papers — key material survived redaction:');
  for (const leak of leaks) console.error(`  • ${leak}`);
  process.exit(1);
}

// The redacted paper must stay structurally identical: same ids, same order, and
// the same number of answer fields, or the study interface would render a
// different paper from the one that was authored.
for (let i = 0; i < MOCK_EXAMS.length; i += 1) {
  const full = MOCK_EXAMS[i];
  const redacted = learnerExams[i];
  if (full.id !== redacted.id) {
    console.error(`Paper order changed at index ${i}: ${full.id} -> ${redacted.id}`);
    process.exit(1);
  }
  for (const section of full.sections) {
    for (const id of section.questionIds) {
      const a = full.questions[id];
      const b = redacted.questions[id];
      if (a.kind !== b.kind) {
        console.error(`${full.id}/${id}: question kind changed under redaction`);
        process.exit(1);
      }
      if (a.kind === 'entry' && a.lines.length !== b.lines.length) {
        console.error(`${full.id}/${id}: entry line count changed under redaction`);
        process.exit(1);
      }
      if (a.kind === 'schedule' && a.rows.length !== b.rows.length) {
        console.error(`${full.id}/${id}: schedule row count changed under redaction`);
        process.exit(1);
      }
      if (a.kind === 'mcq' && a.options.length !== b.options.length) {
        console.error(`${full.id}/${id}: option count changed under redaction`);
        process.exit(1);
      }
    }
  }
}

const body = `/**
 * AUTO-GENERATED — do not edit.
 *
 * Produced by scripts/build-learner-papers.mjs from src/data/exams.
 * These are the redacted papers: prompts, options and structure, with every
 * answer key, worked answer and rationale removed. The study interface imports
 * this module; the authored papers are imported only by the server-side marking
 * engine and by the verification scripts.
 *
 * Run \`npm run gen:papers\` after changing anything in src/data/exams.
 */
import type { MockExam } from '../lib/types';

export const LEARNER_EXAMS: MockExam[] = ${JSON.stringify(learnerExams)};
`;

writeFileSync(target, body);

const kb = Math.round(Buffer.byteLength(body) / 1024);
console.log(`Learner papers written: ${learnerExams.length} papers, ${kb} KB, no key material.`);
