import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { MOCK_EXAMS } from '../data/exams';
import {
  areAuthorCredentials,
  clearAuthorSession,
  readAuthorSession,
  writeAuthorSession,
  type AuthorSession,
} from '../lib/author';
import { clearProgress, emptyProgress, loadProgress, saveProgress, storageAvailable } from '../lib/storage';
import { blankAnswers, pruneBlankRows, reconcileAnswers } from '../data/examKit';
import { deriveExamStates, summarise, type ExamState, type ProgressSummary } from '../lib/progress';
import { emptyEntryAnswer, gradeExam, isBlankEntryAnswer } from '../lib/grading';
import type {
  AnswerSheet,
  AttemptRecord,
  EntryAnswer,
  GradedExam,
  MockExam,
  ProgressState,
  SessionRecord,
} from '../lib/types';

export type Route =
  | { name: 'dashboard' }
  | { name: 'progress' }
  | { name: 'settings' }
  /** `take` opens the answer sheet itself; without it the overview is shown. */
  | { name: 'exam'; examId: string; take?: boolean }
  | { name: 'results'; examId: string }
  | { name: 'review'; examId: string };

interface StudioValue {
  ready: boolean;
  progress: ProgressState;
  exams: MockExam[];
  states: ExamState[];
  summary: ProgressSummary;
  route: Route;
  navigate: (route: Route) => void;
  storageOk: boolean;
  signedIn: boolean;
  /**
   * True while the content console session is open: nothing is locked and every
   * answer key can be read without an attempt.
   */
  authorMode: boolean;
  author: AuthorSession | null;
  grantAuthor: (email: string, key: string) => boolean;
  revokeAuthor: () => void;
  signIn: (session: SessionRecord) => void;
  signOut: () => void;
  setTheme: (theme: ProgressState['theme']) => void;
  resetProgress: () => void;
  attemptFor: (examId: string) => AttemptRecord | null;
  answersFor: (exam: MockExam) => AnswerSheet;
  ensureAttempt: (exam: MockExam, options?: { reset?: boolean }) => void;
  setMcqAnswer: (examId: string, questionId: string, optionKey: string) => void;
  setEntryRow: (examId: string, questionId: string, index: number, patch: Partial<EntryAnswer>) => void;
  addEntryRow: (examId: string, questionId: string) => void;
  /**
   * Empties one line instead of deleting it. `keepAtLeast` is the number of lines
   * the paper expects, so empty lines added on top of them are dropped again.
   */
  clearEntryRow: (examId: string, questionId: string, index: number, keepAtLeast?: number) => void;
  setScheduleCell: (examId: string, questionId: string, key: string, value: string) => void;
  pauseTimer: (examId: string) => void;
  resumeTimer: (examId: string) => void;
  submitExam: (exam: MockExam) => GradedExam | null;
}

const StudioContext = createContext<StudioValue | null>(null);

const nowIso = () => new Date().toISOString();

const freshAttempt = (examId: string, answers: AnswerSheet): AttemptRecord => ({
  examId,
  startedAt: nowIso(),
  submittedAt: null,
  elapsedMs: 0,
  lastRunStartedAt: nowIso(),
  answers,
  result: null,
});

export function StudioProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressState>(() => emptyProgress());
  const [author, setAuthor] = useState<AuthorSession | null>(null);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });
  const [storageOk] = useState(() => storageAvailable());
  const saveHandle = useRef<number | null>(null);
  const latest = useRef(progress);

  useEffect(() => {
    const loaded = loadProgress();
    latest.current = loaded;
    setProgress(loaded);
    setRoute(routeFromKey(loaded.lastVisited));
    setAuthor(readAuthorSession());
    setReady(true);
  }, []);

  const commit = useCallback((updater: (state: ProgressState) => ProgressState) => {
    setProgress((current) => {
      const next = updater(current);
      latest.current = next;
      if (saveHandle.current !== null) window.clearTimeout(saveHandle.current);
      saveHandle.current = window.setTimeout(() => {
        saveProgress(latest.current);
        saveHandle.current = null;
      }, 80);
      return next;
    });
  }, []);

  // Make sure a pending write is not lost when the page goes away.
  useEffect(() => {
    const flush = () => {
      if (saveHandle.current !== null) {
        window.clearTimeout(saveHandle.current);
        saveHandle.current = null;
      }
      saveProgress(latest.current);
    };
    window.addEventListener('beforeunload', flush);
    window.addEventListener('pagehide', flush);
    return () => {
      window.removeEventListener('beforeunload', flush);
      window.removeEventListener('pagehide', flush);
      flush();
    };
  }, []);

  const authorMode = author !== null;

  const states = useMemo(
    () => deriveExamStates(MOCK_EXAMS, progress, { unrestricted: authorMode }),
    [progress, authorMode],
  );
  const summary = useMemo(() => summarise(states), [states]);

  const navigate = useCallback(
    (next: Route) => {
      setRoute(next);
      commit((state) => ({
        ...state,
        lastVisited: routeKey(next),
        activeExamId: 'examId' in next ? next.examId : state.activeExamId,
      }));
    },
    [commit],
  );

  const signIn = useCallback(
    (session: SessionRecord) => {
      commit((state) => ({ ...state, session }));
      setRoute({ name: 'dashboard' });
    },
    [commit],
  );

  const signOut = useCallback(() => {
    commit((state) => ({ ...state, session: null }));
    setRoute({ name: 'dashboard' });
  }, [commit]);

  const setTheme = useCallback(
    (theme: ProgressState['theme']) => commit((state) => ({ ...state, theme })),
    [commit],
  );

  const grantAuthor = useCallback((email: string, key: string) => {
    if (!areAuthorCredentials(email, key)) return false;
    setAuthor(writeAuthorSession());
    return true;
  }, []);

  const revokeAuthor = useCallback(() => {
    clearAuthorSession();
    setAuthor(null);
  }, []);

  const resetProgress = useCallback(() => {
    clearProgress();
    const fresh = emptyProgress();
    latest.current = fresh;
    setProgress(fresh);
    setRoute({ name: 'dashboard' });
  }, []);

  const attemptFor = useCallback((examId: string) => progress.attempts[examId] ?? null, [progress]);

  const answersFor = useCallback(
    (exam: MockExam): AnswerSheet => reconcileAnswers(exam, progress.attempts[exam.id]?.answers),
    [progress],
  );

  /**
   * Apply a change to one attempt. When the updater returns the attempt it was
   * given, the state is left untouched so React bails out instead of re-rendering
   * and re-running effects that would call straight back in here.
   */
  const updateAttempt = useCallback(
    (examId: string, updater: (attempt: AttemptRecord) => AttemptRecord) => {
      commit((state) => {
        const existing = state.attempts[examId] ?? freshAttempt(examId, {});
        const next = updater(existing);
        if (next === existing) return state;
        return { ...state, attempts: { ...state.attempts, [examId]: next } };
      });
    },
    [commit],
  );

  // Reads the live state rather than a captured render value, so the callback
  // keeps a stable identity and never re-triggers the effects that call it.
  const ensureAttempt = useCallback(
    (exam: MockExam, options?: { reset?: boolean }) => {
      if (latest.current.attempts[exam.id] && !options?.reset) return;
      const fresh = freshAttempt(exam.id, blankAnswers(exam));
      commit((state) => ({ ...state, attempts: { ...state.attempts, [exam.id]: fresh } }));
    },
    [commit],
  );

  const setMcqAnswer = useCallback(
    (examId: string, questionId: string, optionKey: string) => {
      updateAttempt(examId, (attempt) => ({
        ...attempt,
        startedAt: attempt.startedAt ?? nowIso(),
        answers: { ...attempt.answers, mcq: { ...(attempt.answers.mcq ?? {}), [questionId]: optionKey } },
      }));
    },
    [updateAttempt],
  );

  const setEntryRow = useCallback(
    (examId: string, questionId: string, index: number, patch: Partial<EntryAnswer>) => {
      updateAttempt(examId, (attempt) => {
        const rows = [...(attempt.answers.entries?.[questionId] ?? [])];
        while (rows.length <= index) {
          rows.push({ date: '', category: '', number: '', wording: '', debit: '', credit: '' });
        }
        rows[index] = { ...rows[index], ...patch };
        return {
          ...attempt,
          startedAt: attempt.startedAt ?? nowIso(),
          answers: { ...attempt.answers, entries: { ...(attempt.answers.entries ?? {}), [questionId]: rows } },
        };
      });
    },
    [updateAttempt],
  );

  const addEntryRow = useCallback(
    (examId: string, questionId: string) => {
      updateAttempt(examId, (attempt) => {
        const rows = [...(attempt.answers.entries?.[questionId] ?? [])];
        rows.push({ date: '', category: '', number: '', wording: '', debit: '', credit: '' });
        return {
          ...attempt,
          answers: { ...attempt.answers, entries: { ...(attempt.answers.entries ?? {}), [questionId]: rows } },
        };
      });
    },
    [updateAttempt],
  );

  const clearEntryRow = useCallback(
    (examId: string, questionId: string, index: number, keepAtLeast = 1) => {
      updateAttempt(examId, (attempt) => {
        const before = attempt.answers.entries?.[questionId] ?? [];
        if (!before[index]) return attempt;

        const rows = [...before];
        rows[index] = emptyEntryAnswer();

        // Never leave unused blank lines behind: trim them back to the paper's rows.
        const floor = Math.max(1, keepAtLeast);
        while (rows.length > floor && isBlankEntryAnswer(rows[rows.length - 1])) rows.pop();

        if (rows.length === before.length && isBlankEntryAnswer(before[index])) return attempt;
        return {
          ...attempt,
          answers: { ...attempt.answers, entries: { ...(attempt.answers.entries ?? {}), [questionId]: rows } },
        };
      });
    },
    [updateAttempt],
  );

  const setScheduleCell = useCallback(
    (examId: string, questionId: string, key: string, value: string) => {
      updateAttempt(examId, (attempt) => ({
        ...attempt,
        startedAt: attempt.startedAt ?? nowIso(),
        answers: {
          ...attempt.answers,
          schedules: {
            ...(attempt.answers.schedules ?? {}),
            [questionId]: { ...(attempt.answers.schedules?.[questionId] ?? {}), [key]: value },
          },
        },
      }));
    },
    [updateAttempt],
  );

  const pauseTimer = useCallback(
    (examId: string) => {
      // Nothing running: leave the state exactly as it is.
      const running = latest.current.attempts[examId]?.lastRunStartedAt;
      if (!running) return;
      updateAttempt(examId, (attempt) => {
        if (!attempt.lastRunStartedAt) return attempt;
        const delta = Math.max(0, Date.now() - Date.parse(attempt.lastRunStartedAt));
        return { ...attempt, elapsedMs: attempt.elapsedMs + delta, lastRunStartedAt: null };
      });
    },
    [updateAttempt],
  );

  const resumeTimer = useCallback(
    (examId: string) => {
      const attempt = latest.current.attempts[examId];
      if (!attempt || attempt.lastRunStartedAt || attempt.result) return;
      updateAttempt(examId, (current) =>
        current.lastRunStartedAt || current.result ? current : { ...current, lastRunStartedAt: nowIso() },
      );
    },
    [updateAttempt],
  );

  const submitExam = useCallback(
    (exam: MockExam): GradedExam | null => {
      const existing = progress.attempts[exam.id];
      // Blank lines are dropped from the stored script: they are not attempts.
      const answers = pruneBlankRows(exam, reconcileAnswers(exam, existing?.answers));
      const result = gradeExam(exam, answers);
      commit((state) => {
        const previous = state.attempts[exam.id] ?? freshAttempt(exam.id, answers);
        const elapsed = previous.lastRunStartedAt
          ? previous.elapsedMs + Math.max(0, Date.now() - Date.parse(previous.lastRunStartedAt))
          : previous.elapsedMs;
        return {
          ...state,
          attempts: {
            ...state.attempts,
            [exam.id]: {
              ...previous,
              answers,
              elapsedMs: elapsed,
              lastRunStartedAt: null,
              submittedAt: nowIso(),
              result,
            },
          },
        };
      });
      return result;
    },
    [commit, progress.attempts],
  );

  const value: StudioValue = {
    ready,
    progress,
    exams: MOCK_EXAMS,
    states,
    summary,
    route,
    navigate,
    storageOk,
    signedIn: Boolean(progress.session),
    authorMode,
    author,
    grantAuthor,
    revokeAuthor,
    signIn,
    signOut,
    setTheme,
    resetProgress,
    attemptFor,
    answersFor,
    ensureAttempt,
    setMcqAnswer,
    setEntryRow,
    addEntryRow,
    clearEntryRow,
    setScheduleCell,
    pauseTimer,
    resumeTimer,
    submitExam,
  };

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioValue {
  const value = useContext(StudioContext);
  if (!value) throw new Error('useStudio must be used inside StudioProvider');
  return value;
}

/**
 * The half-finished answer sheet is deliberately not part of the key: a reload
 * always reopens the exam overview, and the exam is re-entered on purpose.
 */
function routeKey(route: Route): string {
  if (route.name === 'exam') return `exam:${route.examId}`;
  if (route.name === 'results' || route.name === 'review') return `${route.name}:${route.examId}`;
  return route.name;
}

/**
 * Restore the page the learner left. A half-finished answer sheet reopens on its
 * overview first, so the exam is only re-entered deliberately.
 */
function routeFromKey(key: string): Route {
  const [name, examId] = key.split(':');
  if (examId) {
    if (name === 'results' || name === 'review' || name === 'exam') return { name, examId } as Route;
  }
  if (key === 'progress' || key === 'settings') return { name: key };
  return { name: 'dashboard' };
}
