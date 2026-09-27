import { useState } from 'react';
import { useStudio } from '../state/StudioContext';
import { StatusBadge } from '../components/StatusBadge';
import { Dialog } from '../components/Dialog';
import { IconArrow, IconCheck, IconLock } from '../components/Icons';
import { formatLocalDateTime, formatPoints } from '../lib/format';
import { examProgress } from '../lib/grading';
import { ChartOfAccountsAnnex } from '../components/ChartOfAccounts';
import type { MockExam } from '../lib/types';

export function ExamOverview({ exam }: { exam: MockExam }) {
  const { states, navigate, answersFor, ensureAttempt, summary, authorMode } = useStudio();
  const state = states.find((entry) => entry.exam.id === exam.id)!;
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [showAnnex, setShowAnnex] = useState(false);

  const part = examProgress(exam, answersFor(exam));
  const otherExams = states.filter((entry) => entry.exam.id !== exam.id);

  const start = () => {
    ensureAttempt(exam);
    navigate({ name: 'exam', examId: exam.id, take: true });
  };

  const restart = () => {
    ensureAttempt(exam, { reset: true });
    setConfirmRestart(false);
    navigate({ name: 'exam', examId: exam.id, take: true });
  };

  if (state.status === 'locked') {
    return (
      <section className="panel panel-pad">
        <div className="row gap-sm wrap mb-sm">
          <span className="badge badge-locked">
            <IconLock /> Locked
          </span>
          <span className="badge">{exam.title}</span>
        </div>
        <h1>{exam.title}</h1>
        <p className="lede">
          This exam opens once {otherExams[exam.number - 2]?.exam.title ?? 'the previous exam'} has been submitted and
          graded. The question content becomes available at that point.
        </p>
        <button type="button" className="btn btn-outline mt" onClick={() => navigate({ name: 'dashboard' })}>
          Back to dashboard
        </button>
      </section>
    );
  }

  return (
    <>
      <header className="page-title">
        <div>
          <div className="row gap-sm wrap mb-sm">
            <StatusBadge status={state.status} score={state.score} />
            {state.submittedAt && (
              <span className="badge">Submitted {formatLocalDateTime(state.submittedAt)}</span>
            )}
          </div>
          <p className="eyebrow">{exam.company}</p>
          <h1>{exam.title}</h1>
          <p className="lede mt-0">{exam.summary}</p>
        </div>
      </header>

      <section className="panel mb">
        <div className="paper-head">
          <div>
            <div className="doc-id">Financial accounting · mock paper</div>
            <div className="doc-title">{exam.title} — {exam.intro.heading}</div>
          </div>
          <div className="doc-marks">
            <div>
              Marks: <strong>{formatPoints(exam.totalPoints)}</strong>
            </div>
            <div>
              Duration: <strong>{exam.durationMinutes} minutes</strong>
            </div>
          </div>
        </div>

        <div className="rule-block">
          <ul>
            <li>Part One — only one answer per question is correct.</li>
            <li>Correct answer = 0.50 point; incorrect answer = −0.25 point; “Don’t know” = 0 point.</li>
            <li>Part Two — marks are awarded per correct entry line or per correct schedule cell.</li>
            <li>
              Part Two — account numbers and wordings are taken from the chart of accounts annex reproduced below.
            </li>
          </ul>
        </div>

        <div className="table-scroll">
          <table className="figures">
            <thead>
              <tr>
                <th>Parts of the exam</th>
                <th className="num">Recommended duration</th>
                <th className="num">Marking scheme</th>
              </tr>
            </thead>
            <tbody>
              {exam.timing.map((row) => (
                <tr key={row.label} className={row.label === 'Total' ? 'emphasis' : undefined}>
                  <td>{row.label}</td>
                  <td className="num">{row.duration}</td>
                  <td className="num">{row.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel mb">
        <div className="panel-head">
          <div className="grow">
            <h3>Annex — chart of accounts</h3>
            <p className="tiny muted" style={{ marginBottom: 0 }}>
              The paper's detachable annex, with the exact wording expected on every entry line. It is also available
              from the toolbar while you answer, and inside each entry question.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            aria-expanded={showAnnex}
            onClick={() => setShowAnnex((value) => !value)}
          >
            {showAnnex ? 'Hide the annex' : 'Show the annex'}
          </button>
        </div>
        {showAnnex && (
          <div className="panel-pad" style={{ borderTop: '1px solid var(--line)' }}>
            <ChartOfAccountsAnnex />
          </div>
        )}
      </section>

      <div className="stat-grid mb">
        <div className="stat">
          <div className="label">Question fields</div>
          <div className="value">{part.total}</div>
        </div>
        <div className="stat">
          <div className="label">Already answered in your draft</div>
          <div className="value">{part.answered}</div>
        </div>
        <div className="stat">
          <div className="label">Topics on this paper</div>
          <div className="value" style={{ fontSize: '0.95rem', fontWeight: 550 }}>
            {exam.topics.length}
          </div>
        </div>
      </div>

      <section className="panel panel-pad mb">
        <h3>Topics covered</h3>
        <div className="row gap-xs wrap">
          {exam.topics.map((topic) => (
            <span className="badge" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      </section>

      <section className="panel panel-pad">
        <div className="row gap wrap" style={{ justifyContent: 'space-between' }}>
          <div className="grow">
            {state.status === 'completed' ? (
              <>
                <h3 style={{ marginBottom: 4 }}>
                  Your score: {formatPoints(state.score ?? 0)} / {formatPoints(exam.totalPoints)}
                </h3>
                <p className="muted mt-0" style={{ marginBottom: 0 }}>
                  Solutions are unlocked for this exam. You can review your answers or retake it with a clean sheet.
                </p>
              </>
            ) : (
              <>
                <h3 style={{ marginBottom: 4 }}>
                  {state.status === 'in-progress' ? 'Continue where you left off' : 'Ready when you are'}
                </h3>
                <p className="muted mt-0" style={{ marginBottom: 0 }}>
                  Every answer is saved in this browser as you type, so you can leave and come back at any time.
                </p>
              </>
            )}
          </div>
          <div className="row gap-sm wrap">
            {state.status === 'completed' ? (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate({ name: 'results', examId: exam.id })}
                >
                  <IconCheck /> Review attempt
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate({ name: 'review', examId: exam.id })}
                >
                  Open solutions
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => setConfirmRestart(true)}>
                  Retake exam
                </button>
              </>
            ) : (
              <>
                <button type="button" className="btn btn-primary btn-lg" onClick={start}>
                  {state.status === 'in-progress' ? 'Continue exam' : 'Start Exam'} <IconArrow />
                </button>
                {authorMode && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => navigate({ name: 'review', examId: exam.id })}
                  >
                    Open answer key
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {state.status !== 'completed' && summary.nextExamTitle && (
          <p className="tiny muted" style={{ marginBottom: 0, marginTop: 14 }}>
            Submitting this exam unlocks {states[exam.number]?.exam.title ?? 'the next mock exam'}.
          </p>
        )}
      </section>

      <Dialog
        open={confirmRestart}
        title={`Retake ${exam.title}?`}
        onDismiss={() => setConfirmRestart(false)}
      >
        <p className="muted small">
          This clears the answers, the score and the submission date recorded for this exam in this browser, and starts a
          fresh attempt. Your other exams are untouched.
        </p>
        <div className="row gap-sm wrap" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => setConfirmRestart(false)}>
            Keep this attempt
          </button>
          <button type="button" className="btn btn-danger" onClick={restart}>
            Start a fresh attempt
          </button>
        </div>
      </Dialog>
    </>
  );
}
