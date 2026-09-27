import { Fragment } from 'react';
import { useStudio } from '../state/StudioContext';
import { ContentTableView } from '../components/QuestionBlocks';
import { IconCheck, IconCross, IconLock } from '../components/Icons';
import { formatAmount, formatIsoDate, formatPoints, parseAmount } from '../lib/format';
import { explanationLines } from '../lib/types';
import type { CellFeedback, LineFeedback, MockExam, QuestionDef, QuestionResult } from '../lib/types';

export function ExamReview({ exam }: { exam: MockExam }) {
  const { attemptFor, answersFor, navigate, states } = useStudio();
  const attempt = attemptFor(exam.id);
  const state = states.find((entry) => entry.exam.id === exam.id)!;
  const graded = attempt?.result ?? null;

  // The marks shown here were computed on the server when the paper was handed
  // in. This page only reads that result: it has no key of its own, and could
  // not recompute one if it wanted to.
  const result = graded;
  const showMine = graded !== null;

  if (!result) {
    return (
      <section className="panel panel-pad">
        <span className="badge badge-locked">
          <IconLock /> Solutions locked
        </span>
        <h1 className="mt-sm">{exam.title} — solutions</h1>
        <p className="lede">
          The solutions for this paper become available once the exam has been submitted and graded.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate({ name: 'exam', examId: exam.id })}>
          Open the exam
        </button>
      </section>
    );
  }

  const answers = answersFor(exam);
  const byId = new Map(result.questions.map((entry) => [entry.questionId, entry]));

  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">{showMine ? 'Solutions' : 'Answer key'} · {exam.company}</p>
          <h1>{exam.title} — {showMine ? 'solution review' : 'answer key'}</h1>
          <p className="lede mt-0">
            {showMine ? (
              <>
                Your score: {formatPoints(result.awarded)} / {formatPoints(result.possible)}. Submitted answers are
                shown alongside the answer key for every question and table.
              </>
            ) : (
              <>
                The complete answer key: every correct option, entry line and schedule value, with the working behind
                each one. Nothing on this paper has been attempted in this browser.
              </>
            )}
          </p>
        </div>
      </header>

      <div className="row gap-sm wrap mb">
        {showMine && (
          <button type="button" className="btn btn-outline" onClick={() => navigate({ name: 'results', examId: exam.id })}>
            ← Back to results
          </button>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => navigate({ name: 'dashboard' })}>
          Back to exam list
        </button>
        {showMine ? (
          <>
            <span className="badge badge-completed">
              <IconCheck /> Solutions unlocked
            </span>
            {state.score !== null && <span className="badge">Score {formatPoints(state.score)} / 20</span>}
          </>
        ) : (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => navigate({ name: 'exam', examId: exam.id, take: true })}>
            Open the question paper
          </button>
        )}
      </div>

      {exam.sections.map((section) => (
        <section className="paper mb" key={section.id}>
          <div className="section-band">
            <div className="label">{section.label}</div>
            <h3>{section.title}</h3>
          </div>

          {section.questionIds.map((id) => {
            const question = exam.questions[id];
            const entry = byId.get(id);
            if (!entry) return null;
            return (
              <div className="q-block" key={id}>
                <div className="q-head">
                  <span className="q-number">
                    {question.kind === 'mcq' ? `Question ${question.number}` : `${question.number})`}
                  </span>
                  <span className="q-points">
                    {question.kind === 'mcq' ? '0.50 marks' : `${question.points.toFixed(2)} marks`}
                  </span>
                  {showMine && (
                    <span className={`badge ${entry.awarded > 0.0001 ? 'badge-correct' : 'badge-wrong'}`}>
                      {entry.awarded > 0.0001 ? <IconCheck /> : <IconCross />} {formatPoints(entry.awarded)} /{' '}
                      {formatPoints(entry.possible)}
                    </span>
                  )}
                </div>

                {question.context && <ContentTableView table={question.context} />}
                <p className="q-prompt">{question.prompt}</p>

                {question.kind === 'mcq' && <McqSolution question={question} entry={entry} showMine={showMine} />}
                {question.kind === 'entry' && <EntrySolution question={question} entry={entry} showMine={showMine} />}
                {question.kind === 'schedule' && (
                  <ScheduleSolution
                    question={question}
                    entry={entry}
                    values={answers.schedules?.[id] ?? {}}
                    showMine={showMine}
                  />
                )}

                <div className="explanation mt">
                  <h4>Why this is right</h4>
                  <ol>
                    {explanationLines(question).map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ol>
                </div>
              </div>
            );
          })}
        </section>
      ))}

      <div className="row gap-sm wrap">
        {showMine && (
          <button type="button" className="btn btn-primary" onClick={() => navigate({ name: 'results', examId: exam.id })}>
            Back to results
          </button>
        )}
        <button type="button" className="btn btn-outline" onClick={() => navigate({ name: 'dashboard' })}>
          Mock exam list
        </button>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */

function McqSolution({
  question,
  entry,
  showMine,
}: {
  question: Extract<QuestionDef, { kind: 'mcq' }>;
  entry: QuestionResult;
  showMine: boolean;
}) {
  return (
    <>
      <div className="mcq-options">
        {question.options.map((option) => {
          const isSelected = entry.selectedKey === option.key;
          const isAnswer = entry.correctKey === option.key;
          const classes = [
            'mcq-option',
            isSelected ? 'is-selected' : '',
            isAnswer ? 'is-correct' : '',
            isSelected && !isAnswer ? 'is-wrong' : '',
            option.key === question.unknownKey ? 'is-unknown' : '',
          ]
            .filter(Boolean)
            .join(' ');
          const rationale = question.optionRationale?.[option.key];
          return (
            <div key={option.key} className={classes}>
              <span className="mcq-key">{option.key === question.unknownKey ? '—' : option.key}</span>
              <div className="grow">
                <div>{option.label}</div>
                {rationale && (isSelected || isAnswer) && <div className="tiny muted">{rationale}</div>}
              </div>
              {isAnswer && (
                <span className="badge badge-correct nowrap">
                  <IconCheck /> Correct
                </span>
              )}
              {showMine && isSelected && !isAnswer && (
                <span className="badge badge-wrong nowrap">
                  <IconCross /> Yours
                </span>
              )}
            </div>
          );
        })}
      </div>
      {showMine && !entry.selectedKey && (
        <div className="callout callout-quiet mt-sm small">No answer was selected for this question.</div>
      )}
      {showMine && entry.wasUnknown && entry.correctKey !== entry.selectedKey && (
        <div className="callout callout-quiet mt-sm small">
          “Don’t know” carries no penalty on this paper, so this question scored 0.00.
        </div>
      )}
    </>
  );
}

function EntrySolution({
  question,
  entry,
  showMine,
}: {
  question: Extract<QuestionDef, { kind: 'entry' }>;
  entry: QuestionResult;
  showMine: boolean;
}) {
  return (
    <>
      <div className="table-scroll">
        <table className="grid">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Category</th>
              <th>Number</th>
              <th>Wording</th>
              <th className="num">Debit</th>
              <th className="num">Credit</th>
            </tr>
          </thead>
          <tbody>
            {question.lines.map((line, index) => {
              const given = entry.lineFeedback?.[index];
              const side = line.debit !== null ? 'Debit' : 'Credit';
              /** A line with no value on any component was left blank on the script. */
              const attempted = Boolean(given?.cells.some((cell) => cell.given.trim() !== ''));
              const missed = Boolean(given?.cells.some((cell) => !cell.correct));
              return (
                <Fragment key={index}>
                  <tr className="emphasis">
                    <td className="num muted">{index + 1}</td>
                    <td>{formatIsoDate(line.date)}</td>
                    <td>{line.category}</td>
                    <td>{line.number}</td>
                    <td>{line.wording}</td>
                    <td className="num">{line.debit !== null ? formatAmount(line.debit) : ''}</td>
                    <td className="num">{line.credit !== null ? formatAmount(line.credit) : ''}</td>
                  </tr>
                  {showMine && !attempted && (
                    <tr>
                      <td />
                      <td colSpan={6} className="tiny muted" style={{ background: 'var(--paper-sunken)' }}>
                        Not attempted — no entry line was submitted for this line, so it scored 0.00.
                      </td>
                    </tr>
                  )}
                  {showMine && attempted && missed && (
                    <tr>
                      <td />
                      <td colSpan={6} style={{ background: 'var(--paper-sunken)' }}>
                        <div className="tiny muted" style={{ marginBottom: 2 }}>
                          Your line {index + 1} — fields to revisit:
                        </div>
                        <div className="row gap-sm wrap tiny">
                          <FieldNote label="date" cell={cellOf(given, 'Date')} render={formatIsoDate} />
                          <FieldNote label="category" cell={cellOf(given, 'Category')} render={identity} />
                          <FieldNote label="number" cell={cellOf(given, 'Account no.')} render={identity} />
                          <FieldNote label="wording" cell={cellOf(given, 'Wording')} render={identity} />
                          <FieldNote
                            label={side.toLowerCase()}
                            cell={cellOf(given, 'Amount')}
                            render={(value) => formatAmount(parseAmount(value))}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td />
                    <td colSpan={6} className="tiny muted" style={{ paddingTop: 0 }}>
                      {line.note}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="row gap-sm wrap tiny mt-sm" style={{ justifyContent: 'space-between' }}>
        <span className="muted">
          {showMine
            ? `${countCorrectLines(entry)} of ${question.lines.length} lines correct · ${(
                question.points / question.lines.length
              ).toFixed(2)} marks per line`
            : `${question.lines.length} lines · ${(question.points / question.lines.length).toFixed(2)} marks per line`}
        </span>
        <span className="muted">
          Totals — debit {formatAmount(totalOf(question, 'debit'))} = credit {formatAmount(totalOf(question, 'credit'))}
        </span>
      </div>
    </>
  );
}

function cellOf(feedback: LineFeedback | undefined, label: string): CellFeedback | undefined {
  return feedback?.cells.find((cell) => cell.label === label);
}

const identity = (value: string) => value;

/**
 * One component of a line the learner got wrong: what they typed, and the value
 * the answer key expects, so the correction can be read field by field.
 */
function FieldNote({
  label,
  cell,
  render,
}: {
  label: string;
  cell: CellFeedback | undefined;
  render: (value: string) => string;
}) {
  if (!cell) return null;
  const shown = cell.given.trim();
  if (cell.correct) {
    return (
      <span>
        {label}: {shown ? render(shown) : '—'} ✓
      </span>
    );
  }
  return (
    <span>
      {label}: {shown ? <s>{render(shown)}</s> : '—'} → <strong>{render(cell.expected)}</strong> ✗
    </span>
  );
}

function countCorrectLines(entry: QuestionResult): number {
  return entry.lineFeedback?.filter((line) => line.lineCorrect).length ?? 0;
}

function totalOf(question: Extract<QuestionDef, { kind: 'entry' }>, side: 'debit' | 'credit'): number {
  return question.lines.reduce((sum, line) => sum + ((side === 'debit' ? line.debit : line.credit) ?? 0), 0);
}

function ScheduleSolution({
  question,
  entry,
  values,
  showMine,
}: {
  question: Extract<QuestionDef, { kind: 'schedule' }>;
  entry: QuestionResult;
  values: Record<string, string>;
  showMine: boolean;
}) {
  return (
    <>
      <div className="table-scroll">
        <table className="grid">
          <thead>
            <tr>
              <th>Item</th>
              {question.columns.map((column) => (
                <th className="num" key={column.key}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {question.rows.map((row) => (
              <tr key={row.key} className={row.emphasis ? 'emphasis' : undefined}>
                <td style={{ paddingLeft: 9 + (row.indent ?? 0) * 16 }}>{row.label}</td>
                {question.columns.map((column) => {
                  const expected = row.cells[column.key];
                  const given = row.given?.[column.key];
                  const key = `${row.key}.${column.key}`;
                  const feedback = entry.cellFeedback?.find((cell) => cell.key === key);
                  if (expected === null || expected === undefined) {
                    return (
                      <td className="num given" key={column.key}>
                        {given ?? ''}
                      </td>
                    );
                  }
                  const mine = values[key] ?? '';
                  return (
                    <td
                      className="num"
                      key={column.key}
                      style={
                        showMine
                          ? { background: feedback?.correct ? 'var(--success-soft)' : 'var(--danger-soft)' }
                          : undefined
                      }
                    >
                      <div>{column.kind === 'amount' ? formatAmount(Number(expected), 0) : String(expected)}</div>
                      {showMine && !feedback?.correct && (
                        <div className="tiny muted">yours: {mine || '—'}</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="tiny muted mt-sm">
        {showMine
          ? `${(entry.cellFeedback ?? []).filter((cell) => cell.correct).length} of ${
              entry.cellFeedback?.length ?? 0
            } cells correct · ${entry.cellFeedback?.length ? (question.points / entry.cellFeedback.length).toFixed(2) : '0.00'} marks per cell`
          : `${entry.cellFeedback?.length ?? 0} cells · ${
              entry.cellFeedback?.length ? (question.points / entry.cellFeedback.length).toFixed(2) : '0.00'
            } marks per cell`}
      </div>
    </>
  );
}
