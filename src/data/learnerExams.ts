/**
 * The papers the browser is allowed to see.
 *
 * Everything here is redacted: prompts, options, structure and the chart of
 * accounts, but no answer key, no worked answer and no rationale. The authored
 * papers under `src/data/exams` are deliberately NOT re-exported from this
 * module, so that a study-interface import of `MOCK_EXAMS` is a name the
 * bundler cannot resolve — an accidental leak becomes a build error rather than
 * a silently published answer key.
 *
 * `npm run verify:bundle` asserts that nothing under src/pages, src/components,
 * src/state or src/lib reaches the keyed module.
 */

import type { MockExam } from '../lib/types';
import { LEARNER_EXAMS } from './learnerExams.generated';

export { LEARNER_EXAMS };

export const LEARNER_EXAM_BY_ID: Record<string, MockExam> = Object.fromEntries(
  LEARNER_EXAMS.map((exam) => [exam.id, exam]),
);

export const TOTAL_EXAMS = LEARNER_EXAMS.length;
