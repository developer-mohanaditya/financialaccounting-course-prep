import type {
  AnswerSheet,
  EntryAnswer,
  EntryLine,
  EntryQuestion,
  ExamSection,
  McqQuestion,
  MockExam,
  QuestionDef,
  ScheduleQuestion,
} from '../lib/types';

/** A case item before it receives its position on the paper. */
export type ItemSeed =
  | Omit<EntryQuestion, 'number'>
  | Omit<ScheduleQuestion, 'number'>;
import { MCQ_POOL_A } from './mcqPoolA';
import { MCQ_POOL_B } from './mcqPoolB';
import { MCQ_POOL_C } from './mcqPoolC';
import { MCQ_POOL_D } from './mcqPoolD';
import { emptyEntryAnswer, isBlankEntryAnswer } from '../lib/grading';

/**
 * Build an expected entry line. `side` decides which of the debit/credit
 * columns holds the amount.
 */
export const L = (
  date: string,
  category: EntryLine['category'],
  number: string,
  wording: string,
  amount: number,
  side: 'debit' | 'credit',
  note: string,
): EntryLine => ({
  date,
  category,
  number,
  wording,
  debit: side === 'debit' ? amount : null,
  credit: side === 'credit' ? amount : null,
  note,
});

const ALL_MCQ = [...MCQ_POOL_A, ...MCQ_POOL_B, ...MCQ_POOL_C, ...MCQ_POOL_D];

export const MCQ_BY_ID: Record<string, Omit<McqQuestion, 'number'>> = Object.fromEntries(
  ALL_MCQ.map((seed) => [seed.id, seed]),
);

/** Part One is always ten questions; Part Two always carries fifteen marks. */
export const PART_ONE_MARKS = 5;
export const PART_TWO_MARKS = 15;
export const EXAM_TOTAL_MARKS = PART_ONE_MARKS + PART_TWO_MARKS;

export interface ExamBlueprint {
  id: string;
  number: number;
  company: string;
  caseHeading: string;
  summary: string;
  topics: string[];
  introParagraphs: string[];
  /** Ten MCQ ids, in paper order. */
  mcqIds: string[];
  /** Part Two: numbered transactions, worth 15 marks in total. */
  items: ItemSeed[];
  /** Recommended timing split shown on the overview. */
  timing?: { label: string; duration: string; marks: string }[];
}

export function buildExam(blueprint: ExamBlueprint): MockExam {
  const questions: Record<string, QuestionDef> = {};

  const mcqIds: string[] = [];
  blueprint.mcqIds.forEach((id, index) => {
    const seed = MCQ_BY_ID[id];
    if (!seed) throw new Error(`Unknown MCQ id "${id}" in ${blueprint.id}`);
    const question: McqQuestion = { ...seed, number: index + 1 };
    questions[question.id] = question;
    mcqIds.push(question.id);
  });

  const itemIds: string[] = [];
  blueprint.items.forEach((item, index) => {
    const numbered = { ...item, number: index + 1 } as QuestionDef;
    questions[numbered.id] = numbered;
    itemIds.push(numbered.id);
  });

  const partTwoPoints = blueprint.items.reduce((sum, item) => sum + item.points, 0);
  if (partTwoPoints !== PART_TWO_MARKS) {
    throw new Error(`${blueprint.id} Part Two totals ${partTwoPoints} marks; expected ${PART_TWO_MARKS}`);
  }

  const sections: ExamSection[] = [
    {
      id: 'part-one',
      label: 'Part One',
      title: 'Questions',
      points: PART_ONE_MARKS,
      instructions: [
        'Only one answer per question is correct.',
        'Correct answer = 0.50 point; incorrect answer = -0.25 point; “Don’t know” = 0 point.',
      ],
      questionIds: mcqIds,
    },
    {
      id: 'part-two',
      label: 'Part Two',
      title: `${blueprint.caseHeading}`,
      points: PART_TWO_MARKS,
      instructions: [
        'For each question, complete the table by specifying the entry date for each transaction.',
        'For every account used in an entry, indicate the account category (ASSET, LIABILITY, EXPENSE, REVENUE), the specific account (number and name), and the debit or credit amount.',
        'Marks are awarded per correct entry line: the marks printed with a transaction are divided equally between its lines, and a line scores when its date, category, account number, wording and debit or credit amount all agree with the answer key.',
      ],
      questionIds: itemIds,
    },
  ];

  return {
    id: blueprint.id,
    number: blueprint.number,
    title: `Mock Exam ${blueprint.number}`,
    durationMinutes: 180,
    company: blueprint.company,
    summary: blueprint.summary,
    topics: blueprint.topics,
    timing:
      blueprint.timing ?? [
        { label: 'Part One — Questions', duration: '20 minutes', marks: '/ 5' },
        { label: `Part Two — ${blueprint.caseHeading}`, duration: '2 hours 25 minutes', marks: '/ 15' },
        { label: 'Total', duration: '3 hours', marks: '/ 20' },
      ],
    intro: { heading: blueprint.caseHeading, paragraphs: blueprint.introParagraphs },
    sections,
    questions,
    totalPoints: EXAM_TOTAL_MARKS,
  };
}

/** A blank answer sheet sized to the exam: entry items start with one row per expected line. */
export function blankAnswers(exam: MockExam): AnswerSheet {
  const sheet: AnswerSheet = { mcq: {}, entries: {}, schedules: {} };
  for (const section of exam.sections) {
    for (const id of section.questionIds) {
      const question = exam.questions[id];
      if (question.kind === 'entry') {
        sheet.entries![id] = question.lines.map(() => emptyEntryAnswer());
      } else if (question.kind === 'schedule') {
        sheet.schedules![id] = {};
      }
    }
  }
  return sheet;
}

/** Merge a persisted answer sheet with a blank one so structures always line up. */
export function reconcileAnswers(exam: MockExam, stored: AnswerSheet | undefined): AnswerSheet {
  const blank = blankAnswers(exam);
  if (!stored) return blank;

  for (const section of exam.sections) {
    for (const id of section.questionIds) {
      const question = exam.questions[id];
      if (question.kind === 'mcq') {
        const selected = stored.mcq?.[id];
        if (selected && question.options.some((option) => option.key === selected)) {
          blank.mcq![id] = selected;
        }
      } else if (question.kind === 'entry') {
        const rows = stored.entries?.[id];
        if (rows && rows.length > 0) {
          blank.entries![id] = rows.map((row) => ({
            date: row.date ?? '',
            category: row.category ?? '',
            number: row.number ?? '',
            wording: row.wording ?? '',
            debit: row.debit ?? '',
            credit: row.credit ?? '',
          }));
        }
      } else {
        const values = stored.schedules?.[id];
        if (values) blank.schedules![id] = { ...values };
      }
    }
  }
  return blank;
}

/** True when the learner left the whole line untouched. */
export function isEntryAnswerEmpty(row: EntryAnswer): boolean {
  return isBlankEntryAnswer(row);
}

/**
 * Drop untouched lines from every entry answer. A blank line is not part of the
 * script, so it is never stored or shown once the exam has been submitted.
 */
export function pruneBlankRows(exam: MockExam, sheet: AnswerSheet): AnswerSheet {
  const entries: Record<string, EntryAnswer[]> = {};
  for (const section of exam.sections) {
    for (const id of section.questionIds) {
      if (exam.questions[id].kind !== 'entry') continue;
      entries[id] = (sheet.entries?.[id] ?? []).filter((row) => !isEntryAnswerEmpty(row));
    }
  }
  return { ...sheet, entries };
}
