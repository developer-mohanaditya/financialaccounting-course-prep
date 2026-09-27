// Exercises the cross-device merge.
//
// This is the one piece of logic that can quietly lose a student's work, so it
// is checked directly rather than trusted: whatever the two devices hold, a
// graded result on either side must survive the merge.
//
// Usage: node scripts/verify-sync.mjs
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.verify', 'sync');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

execFileSync(
  path.join(root, 'node_modules', '.bin', 'tsc'),
  [
    path.join('src', 'lib', 'merge.ts'),
    '--outDir',
    path.join('.verify', 'sync'),
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
// A single root file makes tsc infer src/lib as the output root, so the module
// lands at the top of the output directory rather than under lib/.
const { mergeProgress } = require(path.join(outDir, 'merge.js'));

const problems = [];
const check = (condition, message) => {
  if (!condition) problems.push(message);
};

const now = Date.now();
const day = 24 * 60 * 60 * 1000;

const blank = (attempts = {}) => ({
  version: 1,
  session: null,
  attempts,
  activeExamId: null,
  theme: 'system',
  lastVisited: 'dashboard',
});

/** A paper that was sat and handed in. */
const graded = (examId, at, awarded) => ({
  examId,
  startedAt: new Date(at - day).toISOString(),
  submittedAt: new Date(at).toISOString(),
  elapsedMs: 5_400_000,
  lastRunStartedAt: null,
  answers: { mcq: {}, entries: {}, schedules: {} },
  result: { examId, gradedAt: new Date(at).toISOString(), awarded, possible: 20, percentage: 50, sections: [], questions: [] },
});

/** A paper that is open but not handed in. */
const inProgress = (examId, at) => ({
  examId,
  startedAt: new Date(at).toISOString(),
  submittedAt: null,
  elapsedMs: 60_000,
  lastRunStartedAt: new Date(at).toISOString(),
  answers: { mcq: { [`${examId}-q1`]: 'B' }, entries: {}, schedules: {} },
  result: null,
});

// 1. A result on one side is never dropped by a draft on the other.
{
  const local = blank({ 'exam-01': graded('exam-01', now, 14) });
  const remote = blank({ 'exam-01': inProgress('exam-01', now) });
  const { state } = mergeProgress(local, remote);
  check(state.attempts['exam-01'].result !== null, 'a graded result was lost to a newer draft');
}

// 2. The reverse: a draft here, a result there.
{
  const local = blank({ 'exam-01': inProgress('exam-01', now) });
  const remote = blank({ 'exam-01': graded('exam-01', now - day, 11) });
  const { state, adopted } = mergeProgress(local, remote);
  check(state.attempts['exam-01'].result !== null, 'a graded result was lost to a local draft');
  check(adopted.includes('exam-01'), 'the graded attempt was not reported as adopted');
}

// 3. Results on both sides: the later submission wins, and neither is dropped.
{
  const local = blank({ 'exam-01': graded('exam-01', now - day, 9) });
  const remote = blank({ 'exam-01': graded('exam-01', now, 17) });
  const { state } = mergeProgress(local, remote);
  check(state.attempts['exam-01'].result.awarded === 17, 'the later submission did not win');
}

// 4. Different papers on each side are both kept — this is the point.
{
  const local = blank({ 'exam-01': graded('exam-01', now, 12) });
  const remote = blank({ 'exam-02': graded('exam-02', now, 15), 'exam-03': graded('exam-03', now, 8) });
  const { state } = mergeProgress(local, remote);
  check(Object.keys(state.attempts).length === 3, 'papers from both sides were not both kept');
  check(state.attempts['exam-01'].result.awarded === 12, 'the local paper changed');
  check(state.attempts['exam-02'].result.awarded === 15, 'the remote paper was not taken');
}

// 5. Empty against empty changes nothing.
{
  const a = blank();
  const { state, changed } = mergeProgress(a, blank());
  check(!changed, 'merging two empty records reported a change');
  check(Object.keys(state.attempts).length === 0, 'an empty merge produced attempts');
}

// 6. Merging is idempotent: doing it twice changes nothing the second time.
{
  const local = blank({ 'exam-01': graded('exam-01', now, 12) });
  const remote = blank({ 'exam-02': graded('exam-02', now - 1000, 15) });
  const once = mergeProgress(local, remote);
  const twice = mergeProgress(once.state, remote);
  check(!twice.changed, 'merging twice reported a second change');
  check(
    JSON.stringify(once.state) === JSON.stringify(twice.state),
    'merging twice produced a different record',
  );
}

// 7. A guest's work carried up to a new account survives intact.
{
  const guest = blank({ 'exam-01': graded('exam-01', now, 13), 'exam-02': inProgress('exam-02', now) });
  const { state } = mergeProgress(guest, blank());
  check(Object.keys(state.attempts).length === 2, 'a guest record lost work on the way to an account');
  check(state.attempts['exam-01'].result.awarded === 13, "a guest's graded result changed on sign-up");
}

if (problems.length > 0) {
  console.error('FAILED:');
  for (const problem of problems) console.error(`  • ${problem}`);
  process.exit(1);
}

console.log('Merge OK across 7 cases: a graded result is never lost, both sides are kept, and merging twice is a no-op.');
