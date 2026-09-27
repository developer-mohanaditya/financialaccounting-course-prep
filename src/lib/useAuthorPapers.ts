/**
 * Loading full papers for the content console.
 *
 * The papers in the browser bundle are redacted, so the console has to ask the
 * server for the real thing. It asks for them one at a time and keeps whatever
 * it has, so a failure part-way through still shows the papers that did load
 * rather than an empty console.
 *
 * Nothing here is cached: the console is a review tool, and a stale key is worse
 * than a slow one.
 */

import { useQueries } from 'convex/react';
import { api } from '../convex/_generated/api';
import { authorAccessKey } from './author';
import { LEARNER_EXAMS } from '../data/learnerExams';
import type { MockExam } from './types';

export interface AuthorPapersState {
  /** The papers that loaded, in paper order. */
  papers: MockExam[];
  loading: boolean;
  error: string | null;
}

export function useAuthorPapers(): AuthorPapersState {
  const accessKey = authorAccessKey();
  const ids = LEARNER_EXAMS.map((exam) => exam.id);

  // useQueries takes a keyed object and returns, per key, the value once it has
  // arrived, `undefined` while it is still in flight, or the `Error` it threw.
  const results = useQueries(
    Object.fromEntries(
      ids.map((examId) => [
        examId,
        { query: api.exams.authorPaper, args: { examId, accessKey } },
      ]),
    ),
  );

  const papers: MockExam[] = [];
  let loading = false;
  let error: string | null = null;

  for (const id of ids) {
    const result = results[id];
    if (result === undefined) {
      loading = true;
    } else if (result instanceof Error) {
      error ??=
        'The content console could not be opened. Check that AUTHOR_ACCESS_KEY is set on the deployment and matches the key this build was made with.';
    } else {
      papers.push(result as MockExam);
    }
  }

  papers.sort((a, b) => a.number - b.number);

  return { papers, loading, error };
}
