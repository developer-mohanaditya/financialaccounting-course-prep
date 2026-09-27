import type { ContentTable, EntryQuestion, McqQuestion, ScheduleQuestion } from '../lib/types';
import { ACCOUNT_CATEGORIES } from '../lib/types';
import { formatAmount } from '../lib/format';
import type { EntryAnswer, QuestionResult } from '../lib/types';
import { emptyEntryAnswer } from '../lib/grading';
import { isEntryAnswerEmpty } from '../data/examKit';
import { ChartOfAccountsAnnex } from './ChartOfAccounts';
import { IconCheck, IconCross } from './Icons';
import { useState } from 'react';

/* ------------------------------------------------------------------ */
/* Shared                                                              */
/* ------------------------------------------------------------------ */

export function ContentTableView({ table }: { table: ContentTable }) {
  if (!table) return null;
  return (
    <div className="mb">
      {table.caption && <div className="tiny muted mb-sm">{table.caption}</div>}
      <div className="table-scroll">
        <table className="grid">
          <thead>
            <tr>
              {table.columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className={table.emphasisRows?.includes(rowIndex) ? 'emphasis' : undefined}>
                {row.map((cell, cellIndex) => {
                  const isNumber = typeof cell === 'number';
                  const align = table.align?.[cellIndex] ?? (isNumber ? 'right' : 'left');
                  return (
                    <td key={cellIndex} className={align === 'right' ? 'num' : undefined}>
                      {cell === null || cell === undefined
                        ? ''
                        : isNumber
                          ? formatAmount(cell, Number.isInteger(cell) ? 0 : 2)
                          : cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function QuestionHeader({
  number,
  label,
  points,
}: {
  number: number | string;
  label?: string;
  points?: number;
}) {
  return (
    <div className="q-head">
      <span className="q-number">{label ?? `Question ${number}`}</span>
      {points !== undefined && <span className="q-points">{points.toFixed(2)} marks</span>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MCQ                                                                 */
/* ------------------------------------------------------------------ */

export function McqBlock({
  question,
  selected,
  onSelect,
  result,
  lock,
}: {
  question: McqQuestion;
  selected: string | undefined;
  onSelect: (key: string) => void;
  /** Present only after grading. */
  result?: QuestionResult;
  lock?: boolean;
}) {
  return (
    <fieldset className="q-block" style={{ border: 0, margin: 0, minWidth: 0 }}>
      <QuestionHeader number={question.number} points={0.5} />
      {question.context && <ContentTableView table={question.context} />}
      <p className="q-prompt" style={{ fontWeight: 550 }}>{question.prompt}</p>
      <div className="mcq-options" role="radiogroup" aria-label={`Question ${question.number}`}>
        {question.options.map((option) => {
          const isSelected = selected === option.key;
          const graded = Boolean(result);
          const isAnswer = graded && result!.correctKey === option.key;
          const isWrongPick = graded && isSelected && result!.correctKey !== option.key;
          const classes = [
            'mcq-option',
            isSelected ? 'is-selected' : '',
            isAnswer ? 'is-correct' : '',
            isWrongPick ? 'is-wrong' : '',
            option.key === question.unknownKey ? 'is-unknown' : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <label key={option.key} className={classes}>
              <input
                type="radio"
                name={`mcq-${question.id}`}
                value={option.key}
                checked={isSelected}
                disabled={lock}
                onChange={() => onSelect(option.key)}
              />
              <span className="mcq-key">{option.key === question.unknownKey ? '—' : option.key}</span>
              <span className="grow">{option.label}</span>
              {isAnswer && (
                <span className="badge badge-correct">
                  <IconCheck /> Key
                </span>
              )}
              {isWrongPick && (
                <span className="badge badge-wrong">
                  <IconCross /> Yours
                </span>
              )}
            </label>
          );
        })}
      </div>
      {result && !selected && (
        <div className="tiny muted mt-sm">No answer selected — marked as not attempted (0.00 marks).</div>
      )}
      {result?.wasUnknown && (
        <div className="tiny muted mt-sm">
          Answered “Don’t know” — 0.00 marks, neither credited nor penalised.
        </div>
      )}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/* Journal-entry table                                                 */
/* ------------------------------------------------------------------ */

const BLANK_ROW: EntryAnswer = emptyEntryAnswer();

function sideOf(row: EntryAnswer): 'debit' | 'credit' | null {
  const debit = (row.debit ?? '').trim();
  const credit = (row.credit ?? '').trim();
  if (debit && !credit) return 'debit';
  if (credit && !debit) return 'credit';
  return null;
}

export function EntryTableBlock({
  question,
  rows,
  onChange,
  onAdd,
  onClear,
  result,
  lock,
}: {
  question: EntryQuestion;
  rows: EntryAnswer[];
  onChange: (index: number, patch: Partial<EntryAnswer>) => void;
  onAdd: () => void;
  /** Empties the values of one line, leaving the line itself in place. */
  onClear: (index: number) => void;
  result?: QuestionResult;
  lock?: boolean;
}) {
  const [showGuide, setShowGuide] = useState(false);
  /**
   * A line the learner never touched carries no marks, so it is not printed on a
   * submitted paper: only the lines that were actually answered are shown.
   */
  const answered = lock ? rows.filter((row) => !isEntryAnswerEmpty(row)) : rows;
  const lines = answered.length ? answered : [BLANK_ROW];
  const nothingSubmitted = Boolean(lock) && answered.length === 0;

  return (
    <div className="q-block">
      <QuestionHeader number={question.number} label={`${question.number})`} points={question.points} />
      <p className="q-prompt">{question.prompt}</p>
      {question.context && <ContentTableView table={question.context} />}

      <div className="row gap-sm wrap mb-sm">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          aria-expanded={showGuide}
          onClick={() => setShowGuide((value) => !value)}
        >
          {showGuide ? 'Hide account wording (annex)' : 'Account wording (annex)'}
        </button>
        <span className="tiny muted">
          Categories: ASSET, LIABILITY, EXPENSE, REVENUE · dates as dd/mm/yyyy
        </span>
      </div>

      {showGuide && (
        <div className="callout callout-quiet mb">
          <p className="small" style={{ marginTop: 0 }}>
            Enter the entry date, the account category, the account number and its wording, then the amount in either the
            debit or the credit column. Equity accounts (capital, reserves, profit or loss for the year) are reported as
            LIABILITY. Amounts are recorded excluding VAT unless the transaction is not subject to VAT. Copy the wording
            from the annex below — the account number and the wording are both marked.
          </p>
          <ChartOfAccountsAnnex compact />
        </div>
      )}

      {nothingSubmitted ? (
        <div className="callout callout-quiet small">
          No entry line was submitted for this question — it scores 0.00 of {question.points.toFixed(2)}.
        </div>
      ) : (
      <div className="table-scroll">
        <table className="grid">
          <thead>
            <tr>
              <th style={{ width: '2.4em' }} className="num">#</th>
              <th style={{ minWidth: 118 }}>Date</th>
              <th style={{ minWidth: 118 }}>Category</th>
              <th style={{ minWidth: 84 }}>Number</th>
              <th style={{ minWidth: 210 }}>Wording</th>
              <th style={{ minWidth: 118 }} className="num">Debit</th>
              <th style={{ minWidth: 118 }} className="num">Credit</th>
              <th style={{ width: '2.8em' }}>
                <span className="sr-only">Clear line</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {lines.map((row, index) => {
              const feedback = result?.lineFeedback?.[index];
              const cellCorrect = (label: string) =>
                feedback?.cells.find((cell) => cell.label === label)?.correct;
              return (
                <tr key={index}>
                  <td className="num muted">{index + 1}</td>
                  <td>
                    <input
                      type="text"
                      className="entry-cell-date"
                      placeholder="dd/mm/yyyy"
                      inputMode="numeric"
                      autoComplete="off"
                      disabled={lock}
                      aria-label={`Entry date, line ${index + 1}`}
                      value={row.date}
                      onChange={(event) => onChange(index, { date: event.target.value })}
                      style={
                        feedback && !cellCorrect('Date') ? { borderColor: 'var(--danger-line)' } : undefined
                      }
                    />
                  </td>
                  <td>
                    <select
                      disabled={lock}
                      aria-label={`Account category, line ${index + 1}`}
                      value={row.category}
                      onChange={(event) => onChange(index, { category: event.target.value })}
                    >
                      <option value="">—</option>
                      {ACCOUNT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      disabled={lock}
                      aria-label={`Account number, line ${index + 1}`}
                      value={row.number}
                      onChange={(event) => onChange(index, { number: event.target.value })}
                      style={
                        feedback && !cellCorrect('Account no.') ? { borderColor: 'var(--danger-line)' } : undefined
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      autoComplete="off"
                      disabled={lock}
                      aria-label={`Account wording, line ${index + 1}`}
                      value={row.wording}
                      onChange={(event) => onChange(index, { wording: event.target.value })}
                      style={feedback && !cellCorrect('Wording') ? { borderColor: 'var(--danger-line)' } : undefined}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="answer-input"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      disabled={lock}
                      aria-label={`Debit amount, line ${index + 1}`}
                      value={row.debit}
                      onChange={(event) =>
                        onChange(index, {
                          debit: event.target.value,
                          credit: event.target.value.trim() ? '' : row.credit,
                        })
                      }
                      style={
                        feedback && sideOf(row) === 'debit' && !cellCorrect('Amount')
                          ? { borderColor: 'var(--danger-line)' }
                          : undefined
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="answer-input"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0.00"
                      disabled={lock}
                      aria-label={`Credit amount, line ${index + 1}`}
                      value={row.credit}
                      onChange={(event) =>
                        onChange(index, {
                          credit: event.target.value,
                          debit: event.target.value.trim() ? '' : row.debit,
                        })
                      }
                      style={
                        feedback && sideOf(row) === 'credit' && !cellCorrect('Amount')
                          ? { borderColor: 'var(--danger-line)' }
                          : undefined
                      }
                    />
                  </td>
                  <td>
                    {!lock && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        aria-label={`Clear line ${index + 1}`}
                        title="Clear the values on this line"
                        disabled={isEntryAnswerEmpty(row)}
                        onClick={() => onClear(index)}
                      >
                        ×
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      <div className="row gap-sm wrap mt-sm" style={{ justifyContent: 'space-between' }}>
        {!lock ? (
          <button type="button" className="btn btn-outline btn-sm" onClick={onAdd}>
            Add a line
          </button>
        ) : (
          <span className="tiny muted">
            {answered.length} of {question.lines.length} expected lines submitted
          </span>
        )}
        <span className="tiny muted">
          {question.lines.length} line{question.lines.length === 1 ? '' : 's'} expected ·{' '}
          {(question.points / question.lines.length).toFixed(2)} marks per line · blank lines are not marked
        </span>
      </div>

      {result?.lineFeedback && (
        <div className="stack gap-xs mt">
          {result.lineFeedback.map((line, index) => (
            <div
              key={index}
              className={`review-row ${line.lineCorrect ? 'is-correct' : 'is-wrong'}`}
            >
              <span className="rk">Line {index + 1}</span>
              <div className="rv">
                {line.cells
                  .filter((cell) => !cell.correct)
                  .map((cell) => (
                    <div key={cell.label} className="small">
                      <strong>{cell.label}</strong> — your answer: {cell.given || '—'} · key: {cell.expected}
                    </div>
                  ))}
                {line.lineCorrect && <div className="small">Line correct — full marks.</div>}
              </div>
              <span className="badge nowrap">
                {line.lineAwarded.toFixed(2)} / {line.linePossible.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Schedule table                                                      */
/* ------------------------------------------------------------------ */

export function ScheduleTableBlock({
  question,
  values,
  onChange,
  result,
  lock,
}: {
  question: ScheduleQuestion;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  result?: QuestionResult;
  lock?: boolean;
}) {
  const feedbackFor = (key: string) => result?.cellFeedback?.find((cell) => cell.key === key);

  return (
    <div className="q-block">
      <QuestionHeader number={question.number} label={`${question.number})`} points={question.points} />
      <p className="q-prompt">{question.prompt}</p>
      {question.context && <ContentTableView table={question.context} />}

      <div className="table-scroll">
        <table className="grid">
          <thead>
            <tr>
              <th style={{ minWidth: 240 }}>Item</th>
              {question.columns.map((column) => (
                <th key={column.key} className="num" style={{ minWidth: column.width ?? 120 }}>
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
                  const feedback = feedbackFor(key);

                  if (expected === null || expected === undefined) {
                    return (
                      <td key={column.key} className="num given">
                        {given ?? ''}
                      </td>
                    );
                  }

                  return (
                    <td key={column.key} className="num">
                      <input
                        type="text"
                        className="answer-input"
                        inputMode="decimal"
                        autoComplete="off"
                        disabled={lock}
                        aria-label={`${row.label} — ${column.label}`}
                        placeholder={column.kind === 'amount' ? '0.00' : ''}
                        value={values[key] ?? ''}
                        onChange={(event) => onChange(key, event.target.value)}
                        style={
                          feedback && !feedback.correct ? { borderColor: 'var(--danger-line)' } : undefined
                        }
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {result?.cellFeedback && result.cellFeedback.some((cell) => !cell.correct) && (
        <div className="stack gap-xs mt">
          {result.cellFeedback
            .filter((cell) => !cell.correct)
            .map((cell) => (
              <div className="review-row is-wrong" key={cell.key ?? cell.label}>
                <span className="rk">Key</span>
                <div className="rv small">
                  <strong>{cell.label}</strong> — your answer: {cell.given || '—'} · key:{' '}
                  {/^-?\d+(\.\d+)?$/.test(cell.expected) ? formatAmount(Number(cell.expected)) : cell.expected}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
