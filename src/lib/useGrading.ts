/**
 * The browser's route to the marking engine.
 *
 * Marking happens on the server because the answer keys do not exist in the
 * browser. This hook is the whole of the client-side grading surface: it posts an
 * answer sheet and hands back the marks.
 *
 * The one thing worth being careful about is failure. A learner who has just
 * spent two and a half hours on Part Two must never lose that work to a dropped
 * connection, so a failure here is always recoverable — the answers are already
 * saved locally and the call can simply be made again.
 */

import { useCallback, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import type { AnswerSheet, GradedExam } from './types';

export interface GradingFailure {
  /** Whether trying again is worth offering. */
  retryable: boolean;
  message: string;
}

export interface GradingService {
  /** Mark a paper. Resolves to the marks, or throws with a message fit to show. */
  submit: (examId: string, answers: AnswerSheet) => Promise<GradedExam>;
  /** Non-null while a submission is in flight. */
  pending: boolean;
  /** Set when the last attempt failed; cleared when a new one starts. */
  failure: GradingFailure | null;
  clearFailure: () => void;
}

export function useGrading(): GradingService {
  const gradeAttempt = useMutation(api.exams.gradeAttempt);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<GradingFailure | null>(null);

  const submit = useCallback(
    async (examId: string, answers: AnswerSheet): Promise<GradedExam> => {
      setPending(true);
      setFailure(null);
      try {
        return await gradeAttempt({ examId, answers });
      } catch (error) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : 'The marking service could not be reached.';
        setFailure({
          retryable: true,
          message: `Your answers are saved. ${message} Try again when you are back online.`,
        });
        throw error;
      } finally {
        setPending(false);
      }
    },
    [gradeAttempt],
  );

  const clearFailure = useCallback(() => setFailure(null), []);

  return { submit, pending, failure, clearFailure };
}
