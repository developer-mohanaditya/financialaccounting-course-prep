/**
 * Paper redaction — BUILD TIME / SERVER SIDE ONLY.
 *
 * Turns a full paper into the copy the browser is allowed to see. Everything the
 * learner needs in order to *answer* survives; everything that would let them
 * *know the answer* does not.
 *
 * The redacted paper is a `MockExam` with the same shape as the original, on
 * purpose. The study interface reads only a handful of structural facts from a
 * question — how many entry lines it has, which schedule cells are gradable — so
 * blanking the values in place lets the whole rendering layer keep working
 * without being taught a second type. That is what makes this safe to review:
 * there is exactly one paper type, and in the browser it is always empty.
 *
 * What is removed:
 *   - `answerKey` and `optionRationale` on multiple-choice questions
 *   - every `lines` entry on a case transaction (date, category, number,
 *     wording, amounts, and the per-line note)
 *   - every gradable value in a schedule's `cells`, keeping only *which* cells
 *     are gradable
 *   - every `explanation`, which is the worked answer
 *
 * What is kept, because the paper itself prints it:
 *   - prompts, options (label and key), context tables, instructions
 *   - the number of entry lines, and which schedule cells take an answer
 *   - marks, durations, topics, and the chart of accounts annex
 */

import type { EntryLine, MockExam, QuestionDef } from './types';

/**
 * A structurally valid but valueless entry line. Only its presence matters:
 * the study interface uses `lines.length` to size the answer sheet and to show
 * "N of M lines submitted".
 */
const BLANK_ENTRY_LINE: EntryLine = {
  date: '',
  category: 'ASSET',
  number: '',
  wording: '',
  debit: null,
  credit: null,
  note: '',
};

function redactQuestion(question: QuestionDef): QuestionDef {
  switch (question.kind) {
    case 'mcq':
      return {
        ...question,
        // The option keys stay (they are printed on the paper and are needed to
        // record an answer), but which one is correct does not.
        answerKey: '',
        explanation: '',
        optionRationale: undefined,
      };

    case 'entry':
      return {
        ...question,
        lines: question.lines.map(() => ({ ...BLANK_ENTRY_LINE })),
        explanation: [],
      };

    case 'schedule':
      return {
        ...question,
        rows: question.rows.map((row) => ({
          ...row,
          // `null` marks a pre-printed cell and must stay `null`; a gradable cell
          // becomes an empty string, which is still "gradable" to every reader.
          cells: Object.fromEntries(
            Object.entries(row.cells).map(([key, value]) => [
              key,
              value === null || value === undefined ? null : '',
            ]),
          ),
        })),
        explanation: [],
      };
  }
}

/** A copy of `exam` carrying no answer key, worked answer or rationale. */
export function redactExam(exam: MockExam): MockExam {
  const questions: Record<string, QuestionDef> = {};
  for (const [id, question] of Object.entries(exam.questions)) {
    questions[id] = redactQuestion(question);
  }
  return { ...exam, questions };
}

export function redactExams(exams: MockExam[]): MockExam[] {
  return exams.map(redactExam);
}

/* ------------------------------------------------------------------ */
/* Guard                                                               */
/* ------------------------------------------------------------------ */

/**
 * Fails loudly if a redacted paper still carries key material. Used by the
 * verification script and by the build, so a redaction regression cannot reach
 * a deployed bundle unnoticed.
 */
export function findLeakedKeys(exam: MockExam): string[] {
  const leaks: string[] = [];

  for (const [id, question] of Object.entries(exam.questions)) {
    if (question.kind === 'mcq') {
      if (question.answerKey) leaks.push(`${id}: mcq answerKey`);
      if (question.explanation) leaks.push(`${id}: mcq explanation`);
      if (question.optionRationale && Object.keys(question.optionRationale).length > 0) {
        leaks.push(`${id}: mcq optionRationale`);
      }
    } else if (question.kind === 'entry') {
      question.lines.forEach((line, index) => {
        if (line.date) leaks.push(`${id}.lines[${index}].date`);
        if (line.number) leaks.push(`${id}.lines[${index}].number`);
        if (line.wording) leaks.push(`${id}.lines[${index}].wording`);
        if (line.debit !== null || line.credit !== null) leaks.push(`${id}.lines[${index}].amount`);
        if (line.note) leaks.push(`${id}.lines[${index}].note`);
      });
      if (question.explanation.length > 0) leaks.push(`${id}: entry explanation`);
    } else {
      question.rows.forEach((row) => {
        for (const [key, value] of Object.entries(row.cells)) {
          if (value !== null && value !== undefined && value !== '') {
            leaks.push(`${id}.cells[${row.key}.${key}]`);
          }
        }
      });
      if (question.explanation.length > 0) leaks.push(`${id}: schedule explanation`);
    }
  }

  return leaks;
}
