/**
 * Progress meters.
 *
 * Counts how much of a paper the learner has filled in. These functions read the
 * *shape* of a question — how many entry lines it has, which schedule cells are
 * gradable — but never its answer key, so they are safe to run in the browser.
 */

import { isBlankEntryAnswer } from './answerSheet';
import type { AnswerSheet, ExamSection, MockExam, QuestionDef } from './types';

/** Number of answer fields the learner has filled in, per section. */
export function sectionProgress(
  section: ExamSection,
  questions: Record<string, QuestionDef>,
  answers: AnswerSheet,
): { answered: number; total: number } {
  let answered = 0;
  let total = 0;

  for (const id of section.questionIds) {
    const question = questions[id];
    if (question.kind === 'mcq') {
      total += 1;
      if (answers.mcq?.[id]) answered += 1;
      continue;
    }
    if (question.kind === 'entry') {
      total += question.lines.length;
      // Only substantive lines count as progress; a blank or half-blank row does not.
      let filled = 0;
      for (const row of answers.entries?.[id] ?? []) {
        if (isBlankEntryAnswer(row)) continue;
        if (row.number.trim() && (row.debit.trim() || row.credit.trim()) && row.wording.trim()) filled += 1;
      }
      answered += Math.min(filled, question.lines.length);
      continue;
    }
    const gradable = question.rows.flatMap((row) =>
      question.columns.filter((column) => row.cells[column.key] !== null && row.cells[column.key] !== undefined),
    );
    total += gradable.length;
    const values = answers.schedules?.[id] ?? {};
    for (const row of question.rows) {
      for (const column of question.columns) {
        const expected = row.cells[column.key];
        if (expected === null || expected === undefined) continue;
        if ((values[`${row.key}.${column.key}`] ?? '').trim() !== '') answered += 1;
      }
    }
  }

  return { answered, total };
}

export function examProgress(exam: MockExam, answers: AnswerSheet): { answered: number; total: number } {
  return exam.sections.reduce(
    (acc, section) => {
      const part = sectionProgress(section, exam.questions, answers);
      return { answered: acc.answered + part.answered, total: acc.total + part.total };
    },
    { answered: 0, total: 0 },
  );
}

/** Which questions still have an unanswered required field. */
export function unansweredQuestions(exam: MockExam, answers: AnswerSheet): string[] {
  const out: string[] = [];
  for (const section of exam.sections) {
    for (const id of section.questionIds) {
      const question = exam.questions[id];
      if (question.kind === 'mcq') {
        if (!answers.mcq?.[id]) out.push(id);
        continue;
      }
      const part = sectionProgress(
        { ...section, questionIds: [id] },
        exam.questions,
        answers,
      );
      if (part.answered < part.total) out.push(id);
    }
  }
  return out;
}
