/**
 * Progress derivation: exam status, sequential unlocking and summary stats.
 */

import type { AttemptRecord, MockExam, ProgressState } from './types';

export type ExamStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface ExamState {
  exam: MockExam;
  status: ExamStatus;
  attempt: AttemptRecord | null;
  score: number | null;
  submittedAt: string | null;
}

export interface ExamStateOptions {
  /**
   * Skip the sequence entirely: no exam is ever locked and every answer key is
   * readable without an attempt. Used by the content console.
   */
  unrestricted?: boolean;
}

/**
 * Mock Exam 1 is available from the start. Each further exam unlocks as soon as
 * the previous one has been submitted and graded — no minimum score is required.
 */
export function deriveExamStates(
  exams: MockExam[],
  progress: ProgressState,
  options: ExamStateOptions = {},
): ExamState[] {
  const states: ExamState[] = [];
  const unrestricted = options.unrestricted ?? false;
  let previousGraded = true;

  for (const exam of exams) {
    const attempt = progress.attempts[exam.id] ?? null;
    const completed = Boolean(attempt?.result);
    let status: ExamStatus;

    if (completed) status = 'completed';
    else if (!unrestricted && !previousGraded) status = 'locked';
    else if (attempt && (attempt.startedAt || attempt.submittedAt)) status = 'in-progress';
    else status = 'available';

    states.push({
      exam,
      status,
      attempt,
      score: attempt?.result ? attempt.result.awarded : null,
      submittedAt: attempt?.submittedAt ?? null,
    });

    // The next exam unlocks once this one has received a grade.
    previousGraded = completed;
  }

  return states;
}

export function nextAvailable(states: ExamState[]): ExamState | null {
  return states.find((state) => state.status === 'available' || state.status === 'in-progress') ?? null;
}

export interface ProgressSummary {
  completed: number;
  total: number;
  latestScore: number | null;
  latestExamTitle: string | null;
  averageScore: number | null;
  bestScore: number | null;
  nextExamTitle: string | null;
  solutionUnlocked: number;
}

export function summarise(states: ExamState[]): ProgressSummary {
  const completedStates = states.filter((state) => state.status === 'completed');
  const scored = completedStates
    .filter((state) => state.score !== null && state.submittedAt)
    .sort((a, b) => (a.submittedAt! < b.submittedAt! ? -1 : 1));

  const scores = completedStates.map((state) => state.score ?? 0);
  const next = nextAvailable(states);

  return {
    completed: completedStates.length,
    total: states.length,
    latestScore: scored.length ? scored[scored.length - 1].score : null,
    latestExamTitle: scored.length ? scored[scored.length - 1].exam.title : null,
    averageScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100 : null,
    bestScore: scores.length ? Math.max(...scores) : null,
    nextExamTitle: next ? next.exam.title : null,
    solutionUnlocked: completedStates.length,
  };
}

/** Ordered series of scores for the progression chart. */
export function scoreSeries(states: ExamState[]): { label: string; value: number | null; possible: number }[] {
  return states.map((state) => ({
    label: `M${state.exam.number}`,
    value: state.score,
    possible: state.exam.totalPoints,
  }));
}
