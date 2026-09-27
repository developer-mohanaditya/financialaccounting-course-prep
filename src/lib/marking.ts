/**
 * Marking engine — SERVER SIDE ONLY.
 *
 * This module is the reason the answer keys must not ship to the browser. It is
 * imported by the backend grading function and by the offline verification
 * scripts, and by nothing in the study interface.
 *
 * Scoring follows the Exam Training handout exactly:
 *
 *  Part One - Questions
 *    Correct answer  = +0.50 point
 *    Incorrect answer = -0.25 point
 *    Don't know       =  0    point
 *
 *  Part Two - Case
 *    Every numbered transaction carries the mark printed on the paper
 *    ("(1 pt)", "(2 pts)"). Marks are awarded per correct entry line: an
 *    account line scores when its entry date, category, account number,
 *    wording, debit/credit column and amount all agree with the answer key.
 *    A line is therefore worth  (transaction marks / number of lines).
 *
 *  Schedule items inside the case are marked per cell.
 */

import { emptyEntryAnswer, isBlankEntryAnswer } from './answerSheet';
import {
  accountNumberMatches,
  accountWordingMatches,
  amountsEqual,
  datesMatch,
} from './matching';
import { parseAmount } from './format';
import type {
  AnswerSheet,
  CellFeedback,
  EntryAnswer,
  EntryQuestion,
  GradedExam,
  LineFeedback,
  McqQuestion,
  MockExam,
  QuestionDef,
  QuestionResult,
  ScheduleQuestion,
  SectionResult,
} from './types';
import { MCQ_SCORING } from './types';

/* ------------------------------------------------------------------ */
/* Part One                                                            */
/* ------------------------------------------------------------------ */

export function gradeMcq(question: McqQuestion, selected: string | undefined): QuestionResult {
  const result: QuestionResult = {
    questionId: question.id,
    kind: 'mcq',
    awarded: 0,
    possible: MCQ_SCORING.correct,
    selectedKey: selected,
    correctKey: question.answerKey,
    wasUnknown: selected === question.unknownKey,
  };

  if (!selected) {
    result.awarded = 0;
    return result;
  }
  if (selected === question.unknownKey) {
    result.awarded = MCQ_SCORING.unknown;
    return result;
  }
  result.awarded = selected === question.answerKey ? MCQ_SCORING.correct : MCQ_SCORING.incorrect;
  return result;
}

/* ------------------------------------------------------------------ */
/* Part Two - entry lines                                              */
/* ------------------------------------------------------------------ */

function sideOf(line: { debit: number | null; credit: number | null }): 'debit' | 'credit' | 'none' {
  if (line.debit !== null && line.debit !== 0) return 'debit';
  if (line.credit !== null && line.credit !== 0) return 'credit';
  return 'none';
}

function submittedSide(line: EntryAnswer): 'debit' | 'credit' | 'none' {
  const debit = parseAmount(line.debit);
  const credit = parseAmount(line.credit);
  if (debit !== null && debit !== 0) return 'debit';
  if (credit !== null && credit !== 0) return 'credit';
  return 'none';
}

function componentChecks(expected: EntryQuestion['lines'][number], given: EntryAnswer) {
  const expectedSide = sideOf(expected);
  const givenSide = submittedSide(given);
  const expectedAmount = expectedSide === 'debit' ? expected.debit : expected.credit;
  const givenAmount = givenSide === 'debit' ? parseAmount(given.debit) : parseAmount(given.credit);

  return {
    date: datesMatch(given.date, expected.date),
    category: (given.category ?? '').trim().toUpperCase() === expected.category,
    number: accountNumberMatches(given.number, expected.number),
    wording: accountWordingMatches(given.wording, expected.wording),
    side: expectedSide === 'none' ? givenSide === 'none' : expectedSide === givenSide,
    amount: expectedAmount !== null && amountsEqual(givenAmount, expectedAmount),
  };
}

/**
 * Similarity between an expected line and a submitted row, used only to pair the
 * two up before marking. A fully matching line always scores highest (7.5), so a
 * partial match can never be preferred over an exact one.
 */
function lineScore(expected: EntryQuestion['lines'][number], given: EntryAnswer | undefined): number {
  if (!given) return 0;
  const checks = componentChecks(expected, given);
  return (
    (checks.category ? 1 : 0) +
    (checks.number ? 1.5 : 0) +
    (checks.wording ? 1.5 : 0) +
    (checks.side ? 1 : 0) +
    (checks.amount ? 2 : 0) +
    (checks.date ? 0.5 : 0)
  );
}

/** Pair expected lines with submitted rows by descending similarity. */
function matchLines(
  expectedLines: EntryQuestion['lines'],
  rows: EntryAnswer[],
): (number | null)[] {
  const triples: { expected: number; submitted: number; score: number }[] = [];
  expectedLines.forEach((expected, expectedIndex) => {
    rows.forEach((row, submittedIndex) => {
      const score = lineScore(expected, row);
      if (score > 0) triples.push({ expected: expectedIndex, submitted: submittedIndex, score });
    });
  });
  triples.sort((a, b) => b.score - a.score || a.expected - b.expected || a.submitted - b.submitted);

  const matchFor: (number | null)[] = expectedLines.map(() => null);
  const takenExpected = new Set<number>();
  const takenSubmitted = new Set<number>();
  for (const triple of triples) {
    if (takenExpected.has(triple.expected) || takenSubmitted.has(triple.submitted)) continue;
    takenExpected.add(triple.expected);
    takenSubmitted.add(triple.submitted);
    matchFor[triple.expected] = triple.submitted;
  }
  return matchFor;
}

export function gradeEntry(
  question: EntryQuestion,
  submitted: EntryAnswer[] | undefined,
): QuestionResult {
  // Blank lines are dropped before marking: the paper is graded on the lines that
  // were actually answered, and an untouched row can never take marks from one.
  const rows = (submitted ?? []).filter((row) => !isBlankEntryAnswer(row));
  const perLine = question.points / question.lines.length;
  const matchFor = matchLines(question.lines, rows);

  const lineFeedback: LineFeedback[] = question.lines.map((expected, lineIndex) => {
    const matchedIndex = matchFor[lineIndex];
    const given = matchedIndex === null ? undefined : rows[matchedIndex];
    const checks = given ? componentChecks(expected, given) : null;

    const cells: CellFeedback[] = [
      {
        label: 'Date',
        given: given?.date ?? '',
        expected: expected.date,
        correct: checks?.date ?? false,
        awarded: 0,
        possible: 0,
      },
      {
        label: 'Category',
        given: given?.category ?? '',
        expected: expected.category,
        correct: checks?.category ?? false,
        awarded: 0,
        possible: 0,
      },
      {
        label: 'Account no.',
        given: given?.number ?? '',
        expected: expected.number,
        correct: checks?.number ?? false,
        awarded: 0,
        possible: 0,
      },
      {
        label: 'Wording',
        given: given?.wording ?? '',
        expected: expected.wording,
        correct: checks?.wording ?? false,
        awarded: 0,
        possible: 0,
      },
      {
        label: 'Debit / credit',
        given:
          submittedSide(given ?? emptyEntryAnswer()) === 'none'
            ? ''
            : submittedSide(given ?? emptyEntryAnswer()) === 'debit'
              ? 'Debit'
              : 'Credit',
        expected: sideOf(expected) === 'debit' ? 'Debit' : 'Credit',
        correct: checks?.side ?? false,
        awarded: 0,
        possible: 0,
      },
      {
        label: 'Amount',
        given: given
          ? (submittedSide(given) === 'debit' ? given.debit : given.credit)
          : '',
        expected: String(
          sideOf(expected) === 'debit' ? (expected.debit ?? '') : (expected.credit ?? ''),
        ),
        correct: checks?.amount ?? false,
        awarded: 0,
        possible: 0,
      },
    ];

    const allCorrect = cells.every((cell) => cell.correct);
    const awarded = allCorrect ? perLine : 0;

    return { cells, lineAwarded: awarded, linePossible: perLine, lineCorrect: allCorrect };
  });

  const awarded = roundPoints(lineFeedback.reduce((sum, line) => sum + line.lineAwarded, 0));

  return {
    questionId: question.id,
    kind: 'entry',
    awarded,
    possible: question.points,
    lineFeedback,
    submitted: rows,
  };
}

/* ------------------------------------------------------------------ */
/* Part Two - schedule cells                                           */
/* ------------------------------------------------------------------ */

export function gradeSchedule(
  question: ScheduleQuestion,
  submitted: Record<string, string> | undefined,
): QuestionResult {
  const answers = submitted ?? {};
  const gradable: { row: ScheduleQuestion['rows'][number]; column: ScheduleQuestion['columns'][number]; key: string }[] =
    [];

  for (const row of question.rows) {
    for (const column of question.columns) {
      const expected = row.cells[column.key];
      if (expected === null || expected === undefined) continue;
      gradable.push({ row, column, key: `${row.key}.${column.key}` });
    }
  }

  const perCell = gradable.length > 0 ? question.points / gradable.length : 0;

  const cellFeedback: CellFeedback[] = gradable.map(({ row, column, key }) => {
    const expected = row.cells[column.key];
    const given = answers[key] ?? '';
    const correct =
      column.kind === 'amount'
        ? amountsEqual(given, typeof expected === 'number' ? expected : parseAmount(String(expected)))
        : accountWordingMatches(given, String(expected));
    return {
      label: `${row.label} — ${column.label}`,
      given,
      expected: String(expected ?? ''),
      correct,
      awarded: correct ? perCell : 0,
      possible: perCell,
      key,
    };
  });

  const awarded = roundPoints(cellFeedback.reduce((sum, cell) => sum + cell.awarded, 0));

  return {
    questionId: question.id,
    kind: 'schedule',
    awarded,
    possible: question.points,
    cellFeedback,
  };
}

/* ------------------------------------------------------------------ */
/* Whole exam                                                          */
/* ------------------------------------------------------------------ */

export function roundPoints(value: number): number {
  return Math.round(value * 100) / 100;
}

function gradeQuestion(question: QuestionDef, answers: AnswerSheet): QuestionResult {
  switch (question.kind) {
    case 'mcq':
      return gradeMcq(question, answers.mcq?.[question.id]);
    case 'entry':
      return gradeEntry(question, answers.entries?.[question.id]);
    case 'schedule':
      return gradeSchedule(question, answers.schedules?.[question.id]);
  }
}

export function gradeExam(exam: MockExam, answers: AnswerSheet): GradedExam {
  const questions: QuestionResult[] = [];
  const sections: SectionResult[] = [];

  for (const section of exam.sections) {
    const sectionResults = section.questionIds.map((id) => gradeQuestion(exam.questions[id], answers));
    questions.push(...sectionResults);
    sections.push({
      sectionId: section.id,
      label: section.label,
      title: section.title,
      awarded: roundPoints(sectionResults.reduce((sum, result) => sum + result.awarded, 0)),
      possible: roundPoints(sectionResults.reduce((sum, result) => sum + result.possible, 0)),
    });
  }

  const awarded = roundPoints(questions.reduce((sum, result) => sum + result.awarded, 0));
  const possible = roundPoints(questions.reduce((sum, result) => sum + result.possible, 0));

  return {
    examId: exam.id,
    gradedAt: new Date().toISOString(),
    awarded,
    possible,
    percentage: possible > 0 ? Math.round((awarded / possible) * 1000) / 10 : 0,
    sections,
    questions,
  };
}
