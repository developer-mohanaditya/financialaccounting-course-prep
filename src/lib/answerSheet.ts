/**
 * Answer-row helpers.
 *
 * These are structural, not evaluative: they build an empty entry row and decide
 * whether the learner wrote anything on it. Both the study interface and the
 * server-side marking engine need them, so they live here rather than in
 * `marking.ts` — importing this module must never pull scoring logic into the
 * browser bundle.
 */

import type { EntryAnswer } from './types';

export function emptyEntryAnswer(): EntryAnswer {
  return { date: '', category: '', number: '', wording: '', debit: '', credit: '' };
}

/**
 * A line the learner never wrote anything on. Blank lines are not attempts: they
 * cannot be paired with an expected line, they carry no marks, and they are left
 * off the graded script.
 */
export function isBlankEntryAnswer(row: EntryAnswer): boolean {
  return ![
    row.date ?? '',
    row.category ?? '',
    row.number ?? '',
    row.wording ?? '',
    row.debit ?? '',
    row.credit ?? '',
  ]
    .join('')
    .trim();
}
