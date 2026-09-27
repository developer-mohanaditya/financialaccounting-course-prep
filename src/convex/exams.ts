/**
 * Server-side marking.
 *
 * This is the only place in the project where an answer key is read. The
 * authored papers are imported into the function bundle, so a browser never
 * receives them: it posts an answer sheet, and gets back marks and feedback.
 *
 * Nothing about the learner is stored. Every function here is a pure function of
 * its arguments — same answers, same marks, every time.
 */

import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { EXAM_BY_ID } from '../data/exams';
import { gradeExam } from '../lib/marking';
import type { AnswerSheet, GradedExam, MockExam } from '../lib/types';

const entryAnswer = v.object({
  date: v.string(),
  category: v.string(),
  number: v.string(),
  wording: v.string(),
  debit: v.string(),
  credit: v.string(),
});

const answerSheet = v.object({
  mcq: v.optional(v.record(v.string(), v.string())),
  entries: v.optional(v.record(v.string(), v.array(entryAnswer))),
  schedules: v.optional(v.record(v.string(), v.record(v.string(), v.string()))),
});

/**
 * Mark a submitted paper.
 *
 * The caller may post any answer sheet it likes; the marks are recomputed here
 * from the key, so a tampered client cannot inflate its own score. A client can
 * of course choose never to call this — which is why the unlocking sequence is
 * likewise a client-side convenience and not a guarantee.
 */
export const gradeAttempt = mutation({
  args: { examId: v.string(), answers: answerSheet },
  handler: async (_ctx, args): Promise<GradedExam> => {
    const exam = EXAM_BY_ID[args.examId];
    if (!exam) throw new Error(`Unknown paper "${args.examId}"`);
    return gradeExam(exam, args.answers as AnswerSheet);
  },
});

/**
 * The full paper, for the content console.
 *
 * The access key is compared against `AUTHOR_ACCESS_KEY` in this function's
 * environment. Being straight about the limit: a static client cannot keep a
 * credential secret, so the key that reaches the browser is the same one the
 * server checks. What the server check buys is rotation — changing
 * AUTHOR_ACCESS_KEY locks out every build already deployed, immediately,
 * without touching the app. There is no claim here that the console is
 * unreachable; it is unreachable to a student who has not read the source.
 */
export const authorPaper = query({
  args: { examId: v.string(), accessKey: v.string() },
  handler: async (_ctx, args): Promise<MockExam> => {
    const expected = (process.env.AUTHOR_ACCESS_KEY ?? '').trim();
    if (!expected) {
      throw new Error(
        'AUTHOR_ACCESS_KEY is not set on the deployment, so the content console is disabled.',
      );
    }
    if (!secretsEqual(args.accessKey.trim(), expected)) {
      throw new Error('Not authorised.');
    }
    const exam = EXAM_BY_ID[args.examId];
    if (!exam) throw new Error(`Unknown paper "${args.examId}"`);
    return exam;
  },
});

/** Length-independent comparison, so a wrong key cannot be found byte by byte. */
function secretsEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
