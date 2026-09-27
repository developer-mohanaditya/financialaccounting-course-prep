/**
 * Answer-sheet shapes for a paper — BROWSER SAFE.
 *
 * Given a (redacted) paper, these build the blank answer sheet, reconcile a saved
 * one against it, and drop untouched lines. They read only the *shape* of a
 * question — how many entry lines it has — so they work equally well on the
 * redacted papers the browser holds and on the full papers the server keeps.
 *
 * This module deliberately imports nothing from `data/`: the answer sheets are
 * shaped here, and the papers themselves arrive already redacted.
 */

import { emptyEntryAnswer, isBlankEntryAnswer } from './answerSheet';
import type { AnswerSheet, EntryAnswer, MockExam } from './types';

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
