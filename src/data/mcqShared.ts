import type { ContentTable, McqOption, McqQuestion } from '../lib/types';

export const DK: McqOption = { key: 'DK', label: "Don't know" };

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

/** A multiple-choice question before it receives its position on a paper. */
export type McqSeed = Omit<McqQuestion, 'number'>;

/**
 * Build a multiple-choice question with "Don't know" appended as the last option,
 * exactly as the Exam Training handout presents it.
 *
 * @param correctIndex zero-based index of the correct option; pass `labels.length`
 *                     when the correct answer is "Don't know".
 */
export function q(
  id: string,
  topic: string,
  prompt: string,
  labels: string[],
  correctIndex: number,
  explanation: string,
  optionRationale?: Record<string, string>,
  context?: ContentTable,
): McqSeed {
  const options: McqOption[] = labels.map((label, index) => ({ key: LETTERS[index], label }));
  options.push(DK);
  const answerKey = correctIndex >= labels.length ? 'DK' : LETTERS[correctIndex];
  return {
    kind: 'mcq',
    id,
    prompt,
    context,
    options,
    answerKey,
    unknownKey: 'DK',
    explanation,
    optionRationale,
    topic,
  };
}
