// Exercises the grading engine against every exam: perfect answers, blank answers,
// messy-but-equivalent answers, and shuffled entry lines.
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, '.verify');

rmSync(outDir, { recursive: true, force: true });
mkdirSync(path.join(outDir, 'ts'), { recursive: true });

execFileSync(
  path.join(root, 'node_modules', '.bin', 'tsc'),
  [
    path.join('src', 'data', 'exams', 'index.ts'),
    path.join('src', 'lib', 'grading.ts'),
    '--outDir',
    path.join('.verify', 'ts'),
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
const { MOCK_EXAMS } = require(path.join(outDir, 'ts', 'data', 'exams', 'index.js'));
const { gradeExam } = require(path.join(outDir, 'ts', 'lib', 'grading.js'));

const problems = [];
const check = (label, actual, expected) => {
  const ok = Math.abs(actual - expected) < 0.005;
  if (!ok) problems.push(`${label}: got ${actual}, expected ${expected}`);
  return ok;
};

for (const exam of MOCK_EXAMS) {
  const perfect = { mcq: {}, entries: {}, schedules: {} };

  for (const id of exam.sections[0].questionIds) {
    perfect.mcq[id] = exam.questions[id].answerKey;
  }
  for (const id of exam.sections[1].questionIds) {
    const question = exam.questions[id];
    if (question.kind === 'entry') {
      perfect.entries[id] = question.lines.map((line) => ({
        date: line.date,
        category: line.category,
        number: line.number,
        wording: line.wording,
        debit: line.debit === null ? '' : String(line.debit),
        credit: line.credit === null ? '' : String(line.credit),
      }));
    } else {
      perfect.schedules[id] = {};
      for (const row of question.rows) {
        for (const column of question.columns) {
          const value = row.cells[column.key];
          if (value === null || value === undefined) continue;
          perfect.schedules[id][`${row.key}.${column.key}`] = String(value);
        }
      }
    }
  }

  // 1 — a perfect paper scores full marks.
  const full = gradeExam(exam, perfect);
  check(`${exam.id} perfect total`, full.awarded, 20);
  check(`${exam.id} part one`, full.sections[0].awarded, 5);
  check(`${exam.id} part two`, full.sections[1].awarded, 15);

  // 2 — every question must be individually achievable.
  for (const question of full.questions) {
    if (Math.abs(question.awarded - question.possible) > 0.005) {
      problems.push(
        `${exam.id} ${question.questionId}: only ${question.awarded} of ${question.possible} on a perfect answer`,
      );
    }
  }

  // 3 — an empty script scores nothing in Part Two and zero in Part One.
  const blank = gradeExam(exam, { mcq: {}, entries: {}, schedules: {} });
  check(`${exam.id} blank part one`, blank.sections[0].awarded, 0);
  check(`${exam.id} blank part two`, blank.sections[1].awarded, 0);
  check(`${exam.id} blank total`, blank.awarded, 0);

  // 4 — "Don't know" is neutral everywhere in Part One.
  const allUnknown = { mcq: {}, entries: {}, schedules: {} };
  for (const id of exam.sections[0].questionIds) {
    const question = exam.questions[id];
    allUnknown.mcq[id] = question.unknownKey;
  }
  check(`${exam.id} all don't-know part one`, gradeExam(exam, allUnknown).sections[0].awarded, 0);

  // 5 — messy formatting, different casing and reordered lines still score full marks.
  const messy = { mcq: {}, entries: {}, schedules: {} };
  for (const id of exam.sections[0].questionIds) messy.mcq[id] = exam.questions[id].answerKey;
  for (const id of exam.sections[1].questionIds) {
    const question = exam.questions[id];
    if (question.kind === 'entry') {
      messy.entries[id] = question.lines
        .map((line) => ({
          date: formatDateMessy(line.date),
          category: line.category.toLowerCase(),
          number: ` ${line.number} `,
          wording: line.wording.toLowerCase(),
          debit: line.debit === null ? '' : formatAmountMessy(line.debit),
          credit: line.credit === null ? '' : formatAmountMessy(line.credit),
        }))
        .reverse();
    } else {
      messy.schedules[id] = {};
      for (const row of question.rows) {
        for (const column of question.columns) {
          const value = row.cells[column.key];
          if (value === null || value === undefined) continue;
          messy.schedules[id][`${row.key}.${column.key}`] =
            column.kind === 'amount' ? formatAmountMessy(Number(value)) : String(value).toLowerCase();
        }
      }
    }
  }
  const messyResult = gradeExam(exam, messy);
  check(`${exam.id} messy formatting total`, messyResult.awarded, 20);

  // 6 — one wrong amount on a line costs exactly that line's share.
  const item = exam.questions[exam.sections[1].questionIds.find((id) => exam.questions[id].kind === 'entry')];
  const broken = JSON.parse(JSON.stringify(perfect));
  const firstRow = broken.entries[item.id][0];
  const expectedShare = item.points / item.lines.length;
  if (firstRow.debit) firstRow.debit = String(Number(firstRow.debit) + 1);
  else firstRow.credit = String(Number(firstRow.credit) + 1);
  const brokenResult = gradeExam(exam, broken);
  check(
    `${exam.id} ${item.id} single-line error`,
    brokenResult.sections[1].awarded,
    15 - expectedShare,
  );

  // 7 — penalties: one wrong MCQ on a clean paper costs 0.75 against the maximum.
  const oneWrong = { mcq: { ...perfect.mcq }, entries: perfect.entries, schedules: perfect.schedules };
  const firstMcq = exam.questions[exam.sections[0].questionIds[0]];
  oneWrong.mcq[firstMcq.id] = firstMcq.options.find((option) => option.key !== firstMcq.answerKey && option.key !== firstMcq.unknownKey).key;
  check(`${exam.id} one wrong mcq`, gradeExam(exam, oneWrong).sections[0].awarded, 5 - 0.75);

  // 8 — blank lines are inert: padding a perfect script with empty rows keeps 20.00,
  //     a sheet of seeded blank rows scores 0.00, and no blank row survives grading.
  const blankRow = { date: '', category: '', number: '', wording: '', debit: '', credit: '' };
  const padded = JSON.parse(JSON.stringify(perfect));
  const seededBlank = { mcq: {}, entries: {}, schedules: {} };
  for (const id of exam.sections[1].questionIds) {
    const question = exam.questions[id];
    if (question.kind !== 'entry') continue;
    padded.entries[id] = [...padded.entries[id], { ...blankRow }, { ...blankRow }];
    seededBlank.entries[id] = question.lines.map(() => ({ ...blankRow }));
  }
  check(`${exam.id} padded with blank rows`, gradeExam(exam, padded).awarded, 20);

  const seededResult = gradeExam(exam, seededBlank);
  check(`${exam.id} seeded blank rows total`, seededResult.awarded, 0);
  check(`${exam.id} seeded blank rows part two`, seededResult.sections[1].awarded, 0);
  for (const question of seededResult.questions) {
    if (question.kind === 'entry' && (question.submitted ?? []).length !== 0) {
      problems.push(`${exam.id} ${question.questionId}: blank rows were kept on the graded script`);
    }
  }

  // 9 — leaving one expected line blank costs exactly that line's share.
  const entryIds = exam.sections[1].questionIds.filter((id) => exam.questions[id].kind === 'entry');
  const partial = exam.questions[entryIds[0]];
  const missingLine = JSON.parse(JSON.stringify(perfect));
  missingLine.entries[partial.id] = missingLine.entries[partial.id].slice(1);
  check(
    `${exam.id} ${partial.id} one blank line`,
    gradeExam(exam, missingLine).sections[1].awarded,
    15 - partial.points / partial.lines.length,
  );
}

function formatAmountMessy(value) {
  if (Number.isInteger(value)) return value.toLocaleString('en-US'); // 1,200 style thousands groups
  return String(value).replace('.', ',');
}

function formatDateMessy(iso) {
  const [y, m, d] = iso.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${Number(d)} ${months[Number(m) - 1]} ${y}`; // e.g. "17 Sep 2026"
}

if (problems.length) {
  console.log(`GRADING FAILURES (${problems.length}):`);
  for (const problem of problems) console.log(`  ✗ ${problem}`);
  process.exit(1);
}

console.log(
  `Grading engine OK across ${MOCK_EXAMS.length} exams: perfect scripts score 20.00, blank scripts 0.00, ` +
    'messy formatting and reordered lines still score full marks, penalties apply line by line, and blank lines ' +
    'are never marked.',
);
