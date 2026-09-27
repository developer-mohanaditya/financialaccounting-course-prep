/**
 * Domain types for the Financial Accounting — Mock Exam Studio.
 *
 * The shape of these types mirrors the Exam Training handout:
 *  - Part One: 10 multiple-choice questions marked +0.50 / -0.25 / 0.
 *  - Part Two: a case made of numbered transactions, each answered in a
 *    DATE | CATEGORY | NUMBER | WORDING | DEBIT | CREDIT entry table.
 */

export type AccountCategory = 'ASSET' | 'LIABILITY' | 'EXPENSE' | 'REVENUE';

export const ACCOUNT_CATEGORIES: AccountCategory[] = [
  'ASSET',
  'LIABILITY',
  'EXPENSE',
  'REVENUE',
];

/** Scoring rules stated on the first page of the Exam Training handout. */
export interface McqScoring {
  correct: number;
  incorrect: number;
  unknown: number;
}

export const MCQ_SCORING: McqScoring = { correct: 0.5, incorrect: -0.25, unknown: 0 };

/** A plain content table used to display invoices, schedules or statements. */
export interface ContentTable {
  caption?: string;
  columns: string[];
  rows: (string | number | null)[][];
  /** Rows that are displayed in bold (totals). */
  emphasisRows?: number[];
  align?: ('left' | 'right')[];
}

export interface McqOption {
  /** Stable key used for persistence; 'A', 'B', 'C'... or 'DK'. */
  key: string;
  label: string;
}

export interface McqQuestion {
  kind: 'mcq';
  id: string;
  /** 1..10 within the exam. */
  number: number;
  prompt: string;
  /** Optional table shown above the prompt (invoice, ledger extract, schedule). */
  context?: ContentTable;
  options: McqOption[];
  /** Option key of the correct answer, or 'DK' when "Don't know" is correct. */
  answerKey: string;
  /** Option key that means "Don't know". */
  unknownKey: string;
  explanation: string;
  /** Optional per-option rationale, keyed by option key. */
  optionRationale?: Record<string, string>;
  topic: string;
}

export interface EntryLine {
  /** Expected entry date in YYYY-MM-DD. */
  date: string;
  category: AccountCategory;
  /** Chart-of-accounts number, e.g. '62'. */
  number: string;
  wording: string;
  /** Amount placed in the DEBIT column (null when the line is a credit). */
  debit: number | null;
  /** Amount placed in the CREDIT column (null when the line is a debit). */
  credit: number | null;
  /** Explanation shown in the solution review for this line. */
  note: string;
}

/** A numbered transaction of Part Two, answered in the handout's table format. */
export interface EntryQuestion {
  kind: 'entry';
  id: string;
  number: number;
  /** Marks printed with the transaction, e.g. "(2 pts)". */
  points: number;
  /** Scenario text, verbatim in tone with the handout. */
  prompt: string;
  /** Extra information table (invoice summary, payroll data, ...). */
  context?: ContentTable;
  /** Reusable columns for an explanation calculation, e.g. 'Acquisition cost = ...'. */
  lines: EntryLine[];
  /** Step-by-step explanation shown after grading. */
  explanation: string[];
  topic: string;
}

export type ScheduleCellKind = 'amount' | 'text';

export interface ScheduleColumn {
  key: string;
  label: string;
  kind: ScheduleCellKind;
  width?: string;
}

export interface ScheduleRow {
  key: string;
  label: string;
  /** Cells the student must fill; a null option list means free text. */
  cells: Record<string, number | string | null>;
  /** Cells pre-printed on the paper (not graded, shown as fixed text). */
  given?: Record<string, string>;
  indent?: number;
  emphasis?: boolean;
}

/** A statement/schedule completion table (balance sheet, income statement, CFS...). */
export interface ScheduleQuestion {
  kind: 'schedule';
  id: string;
  number: number;
  points: number;
  prompt: string;
  context?: ContentTable;
  columns: ScheduleColumn[];
  rows: ScheduleRow[];
  explanation: string[];
  topic: string;
}

export type QuestionDef = McqQuestion | EntryQuestion | ScheduleQuestion;

/** Explanation lines for any question type, always as a list. */
export function explanationLines(question: QuestionDef): string[] {
  if (question.kind === 'mcq') return [question.explanation];
  return question.explanation;
}

export interface ExamSection {
  id: string;
  /** 'Part One', 'Part Two'. */
  label: string;
  title: string;
  /** Instruction lines reproduced above the section, as on the paper. */
  instructions: string[];
  points: number;
  questionIds: string[];
}

export interface ExamCaseIntro {
  /** Case heading, e.g. 'Novara case'. */
  heading: string;
  paragraphs: string[];
}

export interface MockExam {
  id: string;
  /** 1..10. */
  number: number;
  title: string;
  /** Session length in minutes. */
  durationMinutes: number;
  /** Company used by the Part Two case. */
  company: string;
  /** One-line summary shown on dashboard cards. */
  summary: string;
  /** Topic labels covered, shown on the overview. */
  topics: string[];
  /** Timing table mirroring the paper's instructions block. */
  timing: { label: string; duration: string; marks: string }[];
  intro: ExamCaseIntro;
  sections: ExamSection[];
  questions: Record<string, QuestionDef>;
  totalPoints: number;
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

export interface SessionRecord {
  kind: 'guest' | 'email';
  label: string;
  startedAt: string;
}

export type EntryAnswer = {
  date: string;
  category: string;
  number: string;
  wording: string;
  debit: string;
  credit: string;
};

export interface AnswerSheet {
  mcq?: Record<string, string>;
  entries?: Record<string, EntryAnswer[]>;
  schedules?: Record<string, Record<string, string>>;
}

export interface AttemptRecord {
  examId: string;
  startedAt: string | null;
  submittedAt: string | null;
  /** Milliseconds of elapsed answering time (excluding paused time). */
  elapsedMs: number;
  /** Persisted when the exam was resumed after leaving the page. */
  lastRunStartedAt: string | null;
  answers: AnswerSheet;
  result: GradedExam | null;
}

export interface ProgressState {
  version: number;
  session: SessionRecord | null;
  attempts: Record<string, AttemptRecord>;
  activeExamId: string | null;
  theme: 'light' | 'dark' | 'system';
  lastVisited: string;
}

/* ------------------------------------------------------------------ */
/* Grading                                                             */
/* ------------------------------------------------------------------ */

export interface CellFeedback {
  /** Optional stable key used to align feedback with the rendered field. */
  key?: string;
  label: string;
  given: string;
  expected: string;
  correct: boolean;
  awarded: number;
  possible: number;
}

export interface LineFeedback {
  cells: CellFeedback[];
  lineAwarded: number;
  linePossible: number;
  lineCorrect: boolean;
}

export interface QuestionResult {
  questionId: string;
  kind: QuestionDef['kind'];
  awarded: number;
  possible: number;
  /** MCQ only. */
  selectedKey?: string;
  correctKey?: string;
  wasUnknown?: boolean;
  /** Entry only. */
  lineFeedback?: LineFeedback[];
  /** Schedule only. */
  cellFeedback?: CellFeedback[];
  /** Entry only: the raw submitted rows, for side-by-side review. */
  submitted?: EntryAnswer[];
}

export interface SectionResult {
  sectionId: string;
  label: string;
  title: string;
  awarded: number;
  possible: number;
}

export interface GradedExam {
  examId: string;
  gradedAt: string;
  awarded: number;
  possible: number;
  percentage: number;
  sections: SectionResult[];
  questions: QuestionResult[];
}
