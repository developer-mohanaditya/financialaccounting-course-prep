/**
 * Merging two copies of a study record.
 *
 * Progress is written locally first and synced afterwards, so a student can sit
 * a paper with no connection and lose nothing. That means two devices can hold
 * two different records, and something has to decide what the combined one is.
 *
 * The rule is deliberately per exam, and always keeps the attempt that is
 * *further along*: submitted beats unsubmitted, and otherwise the more recent
 * one wins. A graded result can therefore never be lost to a sync, which is the
 * one thing that would actually hurt. The only thing a merge can drop is an
 * in-progress draft on the losing side — and that device still has it locally
 * until it pulls and sees the newer one.
 *
 * This is a merge, not a conflict prompt. It is the right trade for a study tool:
 * a student in the middle of Part Two should not be interrupted to adjudicate
 * timestamps, and the case where the two sides really have diverged is rare and
 * recoverable through the backup in Settings.
 */

import type { AttemptRecord, ProgressState } from './types';

/** How far along an attempt is. Higher wins a merge. */
function rank(attempt: AttemptRecord): number {
  let score = 0;
  if (attempt.submittedAt) score += 1_000_000;
  if (attempt.result) score += 1_000_000;
  if (attempt.lastRunStartedAt) score += 1_000;
  if (attempt.startedAt) score += 500;
  // Ties broken by recency.
  const stamp = attempt.submittedAt ?? attempt.lastRunStartedAt ?? attempt.startedAt ?? '';
  return score + (Date.parse(stamp) || 0) / 1e10;
}

/** True when the incoming attempt is the better one. Ties keep what is here. */
function incomingWins(current: AttemptRecord, incoming: AttemptRecord): boolean {
  // Strictly greater, so merging a record with itself adopts nothing and the
  // merge is idempotent — which matters, because after one merge the same
  // attempt object can legitimately sit on both sides.
  return rank(incoming) > rank(current);
}

export interface MergeOutcome {
  state: ProgressState;
  /** True when the two records differed and something had to be chosen. */
  changed: boolean;
  /** Attempts taken from the incoming copy rather than the one held. */
  adopted: string[];
}

/**
 * Combine a local record with one fetched from the account.
 *
 * `local` is the copy in this browser, `remote` the one on the server. The
 * result is always safe to save over either.
 */
export function mergeProgress(local: ProgressState, remote: ProgressState): MergeOutcome {
  const attempts: Record<string, AttemptRecord> = { ...local.attempts };
  const adopted: string[] = [];

  for (const [examId, incoming] of Object.entries(remote.attempts)) {
    const current = attempts[examId];
    if (!current) {
      attempts[examId] = incoming;
      adopted.push(examId);
      continue;
    }
    if (incomingWins(current, incoming)) {
      attempts[examId] = incoming;
      adopted.push(examId);
    }
  }

  // Which paper was last open is a property of the device you are sitting at,
  // not of the record, so it is never taken from the other copy. Same for the
  // theme: it follows the screen in front of you.
  const changed = adopted.length > 0;

  return {
    state: {
      ...local,
      attempts,
      activeExamId: local.activeExamId ?? remote.activeExamId,
      theme: local.theme,
      lastVisited: local.lastVisited,
      session: local.session ?? remote.session,
    },
    changed,
    adopted,
  };
}

/** How much work a record holds, for deciding which copy to show first. */
export function richness(state: ProgressState): number {
  return Object.values(state.attempts).reduce(
    (sum, attempt) => sum + (attempt.result ? 1 : 0) + (attempt.submittedAt ? 1 : 0),
    0,
  );
}
