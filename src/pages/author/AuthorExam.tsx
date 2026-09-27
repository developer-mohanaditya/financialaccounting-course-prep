import { useState } from 'react';
import { ContentTableView } from '../../components/QuestionBlocks';
import { IconArrow, IconCheck } from '../../components/Icons';
import { formatAmount, formatIsoDate, formatPoints } from '../../lib/format';
import { explanationLines } from '../../lib/types';
import type { MockExam, QuestionDef } from '../../lib/types';

type Tab = 'paper' | 'key' | 'marking';

const TABS: { id: Tab; label: string }[] = [
  { id: 'paper', label: 'Paper' },
  { id: 'key', label: 'Answer key' },
  { id: 'marking', label: 'Marking & notes' },
];

export function AuthorExam({
  exam,
  onBack,
  onOpenPaper,
  onOpenSolutions,
}: {
  exam: MockExam;
  onBack: () => void;
  onOpenPaper: () => void;
  onOpenSolutions: () => void;
}) {
  const [tab, setTab] = useState<Tab>('paper');

  const mcqs = exam.sections
    .flatMap((section) => section.questionIds)
    .map((id) => exam.questions[id])
    .filter((question): question is Extract<QuestionDef, { kind: 'mcq' }> => question.kind === 'mcq');
  const caseItems = exam.sections
    .filter((section) => section.id !== 'part-one')
    .flatMap((section) => section.questionIds)
    .map((id) => exam.questions[id])
    .filter(
      (question): question is Exclude<QuestionDef, { kind: 'mcq' }> => question.kind !== 'mcq',
    );

  return (
    <div className="console">
      <header className="console-bar">
        <div className="console-bar-inner">
          <button type="button" className="btn btn-ghost btn-sm" onClick={onBack}>
            ← All papers
          </button>
          <div className="grow">
            <div className="tb-title">{exam.title}</div>
            <div className="tb-meta">
              {exam.company} · {exam.intro.heading} · {formatPoints(exam.totalPoints)} marks
            </div>
          </div>
          <button type="button" className="btn btn-outline btn-sm" onClick={onOpenPaper}>
            Open paper <IconArrow />
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={onOpenSolutions}>
            Open solutions
          </button>
        </div>
      </header>

      <div className="console-pad">
        <nav className="tabs" aria-label="Exam content">
          {TABS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className={`tab${tab === entry.id ? ' is-active' : ''}`}
              aria-selected={tab === entry.id}
              onClick={() => setTab(entry.id)}
            >
              {entry.label}
            </button>
          ))}
        </nav>

        {tab === 'paper' && (
          <>
            <section className="panel panel-pad mb">
              <p className="eyebrow">Case</p>
              <h3 style={{ marginTop: 2 }}>{exam.intro.heading}</h3>
              {exam.intro.paragraphs.map((paragraph) => (
                <p className="small" key={paragraph}>
                  {paragraph}
                </p>
              ))}
              <div className="row gap-xs wrap mt-sm">
                {exam.topics.map((topic) => (
                  <span className="badge" key={topic}>
                    {topic}
                  </span>
                ))}
              </div>
            </section>

            {exam.sections.map((section) => (
              <section className="paper mb" key={section.id}>
                <div className="section-band">
                  <div className="label">{section.label}</div>
                  <h3>
                    {section.title} · {formatPoints(section.points)} marks
                  </h3>
                </div>
                <div className="section-instructions">
                  <ul>
                    {section.instructions.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>
                <div className="panel-pad">
                  {section.questionIds.map((id) => {
                    const question = exam.questions[id];
                    return (
                      <div className="q-block" key={id}>
                        <div className="q-head">
                          <span className="q-number">
                            {question.kind === 'mcq' ? `Question ${question.number}` : `${question.number})`}
                          </span>
                          <span className="q-points">
                            {question.kind === 'mcq' ? '0.50 marks' : `${formatPoints(question.points)} marks`}
                          </span>
                          <span className="badge">{question.topic}</span>
                        </div>
                        {question.context && <ContentTableView table={question.context} />}
                        <p className="q-prompt">{question.prompt}</p>
                        {question.kind === 'entry' && (
                          <p className="tiny muted" style={{ marginBottom: 0 }}>
                            Answer table: {question.lines.length} lines to complete — DATE, CATEGORY, NUMBER, WORDING,
                            DEBIT, CREDIT.
                          </p>
                        )}
                        {question.kind === 'schedule' && (
                          <p className="tiny muted" style={{ marginBottom: 0 }}>
                            Statement table: {question.columns.length} columns ·{' '}
                            {question.rows.filter((row) =>
                              question.columns.some((column) => row.cells[column.key] !== null),
                            ).length}{' '}
                            gradable rows.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </>
        )}

        {tab === 'key' && (
          <>
            <section className="panel mb">
              <div className="panel-pad">
                <h3>Part One · answer key</h3>
                <p className="muted small mt-0">
                  {mcqs.length} questions, marked +0.50 correct, −0.25 incorrect, 0 for “Don&apos;t know”.
                </p>
              </div>
              <div className="table-scroll">
                <table className="figures">
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>#</th>
                      <th style={{ width: 60 }}>Key</th>
                      <th>Correct option</th>
                      <th>Topic</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mcqs.map((question) => {
                      const correct = question.options.find((option) => option.key === question.answerKey);
                      return (
                        <tr key={question.id}>
                          <td className="num">{question.number}</td>
                          <td>
                            <span className="badge badge-correct">
                              <IconCheck /> {question.answerKey}
                            </span>
                          </td>
                          <td>{correct?.label ?? '—'}</td>
                          <td className="muted small">{question.topic}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {caseItems.map((question) => (
              <section className="panel mb" key={question.id}>
                <div className="panel-pad">
                  <div className="row gap-sm wrap">
                    <span className="q-number">{question.number})</span>
                    <span className="q-points">{formatPoints(question.points)} marks</span>
                    <span className="badge">{question.topic}</span>
                  </div>
                  <p className="q-prompt">{question.prompt}</p>
                </div>

                {question.kind === 'entry' ? (
                  <EntryKeyTable question={question} />
                ) : (
                  <ScheduleKeyTable question={question} />
                )}
              </section>
            ))}
          </>
        )}

        {tab === 'marking' && (
          <>
            {[...mcqs, ...caseItems].map((question) => (
              <section className="panel panel-pad mb" key={question.id}>
                <div className="row gap-sm wrap">
                  <span className="q-number">
                    {question.kind === 'mcq' ? `Question ${question.number}` : `${question.number})`}
                  </span>
                  <span className="q-points">
                    {formatPoints(question.kind === 'mcq' ? 0.5 : question.points)} marks
                  </span>
                  {question.kind === 'entry' && (
                    <span className="badge">
                      {formatPoints(question.points / question.lines.length)} per line · {question.lines.length} lines
                    </span>
                  )}
                  {question.kind === 'schedule' && (
                    <span className="badge">
                      {formatPoints(
                        question.points /
                          Math.max(
                            1,
                            question.rows.flatMap((row) =>
                              question.columns.filter(
                                (column) => row.cells[column.key] !== null && row.cells[column.key] !== undefined,
                              ),
                            ).length,
                          ),
                      )}{' '}
                      per cell
                    </span>
                  )}
                  <span className="badge">{question.topic}</span>
                </div>

                <p className="q-prompt">{question.prompt}</p>

                <div className="explanation">
                  <h4>Marking notes</h4>
                  <ol>
                    {explanationLines(question).map((line, index) => (
                      <li key={index}>{line}</li>
                    ))}
                  </ol>
                </div>

                {question.kind === 'entry' && (
                  <div className="table-scroll mt-sm">
                    <table className="figures">
                      <thead>
                        <tr>
                          <th style={{ width: 48 }}>Line</th>
                          <th>Note shown to the learner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {question.lines.map((line, index) => (
                          <tr key={index}>
                            <td className="num muted">{index + 1}</td>
                            <td className="small">{line.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {question.kind === 'mcq' && question.optionRationale && (
                  <div className="table-scroll mt-sm">
                    <table className="figures">
                      <thead>
                        <tr>
                          <th style={{ width: 60 }}>Option</th>
                          <th>Worked reasoning</th>
                        </tr>
                      </thead>
                      <tbody>
                        {question.options.map((option) => (
                          <tr key={option.key}>
                            <td className="num">
                              {option.key === question.unknownKey ? '—' : option.key}
                              {option.key === question.answerKey && ' ✓'}
                            </td>
                            <td className="small">
                              {question.optionRationale?.[option.key] ??
                                (option.key === question.answerKey
                                  ? `${question.explanation} (Correct answer.)`
                                  : '—')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function EntryKeyTable({ question }: { question: Extract<QuestionDef, { kind: 'entry' }> }) {
  const debitTotal = question.lines.reduce((sum, line) => sum + (line.debit ?? 0), 0);
  const creditTotal = question.lines.reduce((sum, line) => sum + (line.credit ?? 0), 0);

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
            {question.lines.map((line, index) => (
              <tr key={index}>
                <td className="num muted">{index + 1}</td>
                <td>{formatIsoDate(line.date)}</td>
                <td>{line.category}</td>
                <td>{line.number}</td>
                <td>{line.wording}</td>
                <td className="num">{line.debit !== null ? formatAmount(line.debit) : ''}</td>
                <td className="num">{line.credit !== null ? formatAmount(line.credit) : ''}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="emphasis">
              <td />
              <td colSpan={4}>Totals</td>
              <td className="num">{formatAmount(debitTotal)}</td>
              <td className="num">{formatAmount(creditTotal)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      {Math.abs(debitTotal - creditTotal) > 0.004 && (
        <div className="callout callout-danger small" role="alert">
          Debit and credit totals do not agree for this transaction.
        </div>
      )}
    </>
  );
}

function ScheduleKeyTable({ question }: { question: Extract<QuestionDef, { kind: 'schedule' }> }) {
  return (
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
                const printed = row.given?.[column.key];
                if (expected === null || expected === undefined) {
                  return (
                    <td className="num given" key={column.key}>
                      {printed ?? ''}
                    </td>
                  );
                }
                return (
                  <td className="num" key={column.key}>
                    {column.kind === 'amount' ? formatAmount(Number(expected), 0) : String(expected)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
