// Validates the authored mock exams: structure, marks, double-entry balance and keys.
// Usage: node scripts/verify-exams.mjs
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

// The emit is CommonJS, so it needs its own module scope inside a "type": "module" package.
writeFileSync(path.join(outDir, 'package.json'), JSON.stringify({ type: 'commonjs' }));

const require = createRequire(import.meta.url);
const { MOCK_EXAMS } = require(path.join(outDir, 'ts', 'data', 'exams', 'index.js'));

const ACCOUNT_CATEGORIES = new Set(['ASSET', 'LIABILITY', 'EXPENSE', 'REVENUE']);
const problems = [];
const notes = [];
const seenMcq = new Map();

const fail = (exam, message) => problems.push(`[${exam.id}] ${message}`);
const round = (n) => Math.round(n * 100) / 100;

const CHART_NUMBERS = new Set([
  '10', '11', '12', '15', '16',
  '20', '21', '22', '23', '24', '25', '26', '28', '29',
  '31', '35', '37', '39',
  '40', '41', '42', '43', '44', '45', '48', '49',
  '51', '53', '59',
  '60', '61', '62', '63', '64', '65', '66', '665', '67', '68', '69',
  '70', '71', '75', '76', '765', '77', '78',
]);

for (const exam of MOCK_EXAMS) {
  if (exam.totalPoints !== 20) fail(exam, `total points ${exam.totalPoints}, expected 20`);
  if (exam.sections.length !== 2) fail(exam, `expected 2 sections, found ${exam.sections.length}`);

  const partOne = exam.sections.find((s) => s.id === 'part-one');
  const partTwo = exam.sections.find((s) => s.id === 'part-two');
  if (!partOne) fail(exam, 'missing part-one');
  if (!partTwo) fail(exam, 'missing part-two');
  if (partOne) {
    if (partOne.questionIds.length !== 10) fail(exam, `part-one has ${partOne.questionIds.length} questions`);
    if (partOne.points !== 5) fail(exam, `part-one worth ${partOne.points}, expected 5`);
  }

  // ---- part one ------------------------------------------------------
  if (partOne) {
    partOne.questionIds.forEach((id, index) => {
      const question = exam.questions[id];
      if (question.kind !== 'mcq') {
        fail(exam, `${id} in part-one is not an mcq`);
        return;
      }
      if (question.number !== index + 1) fail(exam, `${id}: number ${question.number}, expected ${index + 1}`);
      if (!question.options.some((o) => o.key === question.answerKey)) {
        fail(exam, `${id}: answerKey "${question.answerKey}" is not among the options`);
      }
      if (!question.options.some((o) => o.key === question.unknownKey)) {
        fail(exam, `${id}: unknownKey "${question.unknownKey}" is not among the options`);
      }
      const keys = question.options.map((o) => o.key);
      if (new Set(keys).size !== keys.length) fail(exam, `${id}: duplicate option keys`);
      if (question.options.length < 3) fail(exam, `${id}: fewer than three options`);
      if (!question.explanation || question.explanation.length < 20) fail(exam, `${id}: explanation missing`);
      if (!question.topic) fail(exam, `${id}: missing topic`);
      if (seenMcq.has(id)) notes.push(`${id} reused by ${seenMcq.get(id)} and ${exam.id}`);
      seenMcq.set(id, exam.id);
    });
  }

  // ---- part two ------------------------------------------------------
  if (!partTwo) continue;
  const items = partTwo.questionIds.map((id) => exam.questions[id]);
  if (items.length !== 9) fail(exam, `part-two has ${items.length} items, expected 9`);
  const twoPoint = items.filter((i) => i.points === 2).length;
  const onePoint = items.filter((i) => i.points === 1).length;
  if (twoPoint !== 6 || onePoint !== 3) {
    fail(exam, `part-two mark split is ${twoPoint}×2 + ${onePoint}×1, expected 6×2 + 3×1`);
  }
  if (round(items.reduce((sum, item) => sum + item.points, 0)) !== 15) {
    fail(exam, 'part-two does not total 15 marks');
  }

  items.forEach((item, index) => {
    if (item.number !== index + 1) fail(exam, `${item.id}: numbering ${item.number}, expected ${index + 1}`);
    if (!item.prompt || item.prompt.length < 40) fail(exam, `${item.id}: prompt too short`);
    if (!item.explanation || item.explanation.length < 2) fail(exam, `${item.id}: explanation too short`);
    if (!item.topic) fail(exam, `${item.id}: missing topic`);

    if (item.kind === 'entry') {
      if (item.lines.length < 2) fail(exam, `${item.id}: fewer than two expected lines`);
      item.lines.forEach((entryLine, lineIndex) => {
        const where = `${item.id} line ${lineIndex + 1}`;
        if (!ACCOUNT_CATEGORIES.has(entryLine.category)) fail(exam, `${where}: bad category`);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(entryLine.date)) fail(exam, `${where}: bad date "${entryLine.date}"`);
        if (!CHART_NUMBERS.has(String(entryLine.number))) {
          fail(exam, `${where}: account ${entryLine.number} not in the chart of accounts`);
        }
        if (!entryLine.wording || !entryLine.note) fail(exam, `${where}: missing wording or note`);
        const hasDebit = entryLine.debit !== null && entryLine.debit !== undefined;
        const hasCredit = entryLine.credit !== null && entryLine.credit !== undefined;
        if (hasDebit === hasCredit) fail(exam, `${where}: must be exactly one of debit/credit`);
        const amount = hasDebit ? entryLine.debit : entryLine.credit;
        if (!(amount > 0)) fail(exam, `${where}: amount must be positive`);
      });
      const debits = round(item.lines.reduce((s, l) => s + (l.debit ?? 0), 0));
      const credits = round(item.lines.reduce((s, l) => s + (l.credit ?? 0), 0));
      if (debits !== credits) fail(exam, `${item.id}: debits ${debits} ≠ credits ${credits}`);
      notes.push(`${item.id}: ${item.lines.length} lines, ${round(item.points / item.lines.length)} each`);
    }

    if (item.kind === 'schedule') {
      const gradable = item.rows.flatMap((row) =>
        item.columns.filter((column) => row.cells[column.key] !== null && row.cells[column.key] !== undefined),
      );
      if (gradable.length === 0) fail(exam, `${item.id}: no gradable cells`);
      for (const row of item.rows) {
        for (const column of item.columns) {
          const expected = row.cells[column.key];
          if (expected === null || expected === undefined) continue;
          if (column.kind === 'amount' && typeof expected !== 'number') {
            fail(exam, `${item.id}: ${row.key}.${column.key} should be numeric`);
          }
        }
      }
      notes.push(`${item.id}: ${gradable.length} gradable cells, ${round(item.points / gradable.length)} each`);
    }

    if (item.kind === 'schedule' && item.rows.some((row) => row.key.startsWith('cfs-'))) {
      const pick = (key, column) => {
        const row = item.rows.find((r) => r.key === key);
        if (!row) return null;
        const cell = row.cells[column];
        if (typeof cell === 'number') return cell;
        const given = row.given?.[column];
        return given ? Number(String(given).replace(/[^0-9.-]/g, '')) : null;
      };
      const signed = (key) => {
        const inflow = pick(key, 'in');
        if (inflow !== null) return inflow;
        const outflow = pick(key, 'out');
        return outflow === null ? null : -outflow;
      };
      const op = signed('cfs-operating');
      const inv = signed('cfs-investing');
      const fin = signed('cfs-financing');
      const change = signed('cfs-net-change');
      if (op !== null && inv !== null && fin !== null && change !== null && round(op + inv + fin) !== change) {
        fail(exam, `${item.id}: cash flow ${op} + ${inv} + ${fin} ≠ ${change}`);
      }
      const open = pick('cfs-opening', 'in');
      const close = signed('cfs-closing');
      if (open !== null && change !== null && close !== null && round(open + change) !== close) {
        fail(exam, `${item.id}: opening ${open} + change ${change} ≠ closing ${close}`);
      }
    }
  });
}

console.log(
  `Checked ${MOCK_EXAMS.length} exams · ` +
    `${MOCK_EXAMS.reduce((s, e) => s + e.sections[0].questionIds.length, 0)} part-one questions · ` +
    `${MOCK_EXAMS.reduce((s, e) => s + e.sections[1].questionIds.length, 0)} case items · ` +
    `${new Set(MOCK_EXAMS.flatMap((e) => e.sections[0].questionIds)).size} distinct part-one questions.`,
);

if (notes.length) {
  console.log('\nNotes:');
  for (const note of notes) console.log(`  • ${note}`);
}

if (problems.length) {
  console.log(`\nFAILURES (${problems.length}):`);
  for (const problem of problems) console.log(`  ✗ ${problem}`);
  process.exit(1);
}

console.log('\nOK — every figure reconciles and every key is valid.');
