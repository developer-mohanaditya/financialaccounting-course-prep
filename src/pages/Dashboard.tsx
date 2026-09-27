import { useStudio } from '../state/StudioContext';
import { StatusBadge } from '../components/StatusBadge';
import { IconArrow, IconLock } from '../components/Icons';
import { formatLocalDateTime, formatPoints } from '../lib/format';
import { examProgress } from '../lib/grading';

export function Dashboard() {
  const { states, summary, navigate, answersFor, progress } = useStudio();
  const current = states.find((state) => state.status === 'available' || state.status === 'in-progress') ?? null;

  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">Financial Accounting</p>
          <h1>Your practice</h1>
          <p className="lede mt-0">
            Ten mock exams in the examination format, spread across the course. Submit an exam to receive a grade and
            unlock the next one.
          </p>
        </div>
      </header>

      {current ? (
        <section className="panel mb" aria-label="Current exam">
          <div className="panel-pad">
            <div className="row gap wrap" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="grow">
                <div className="row gap-sm wrap mb-sm">
                  <StatusBadge status={current.status} />
                  <span className="badge">{current.exam.durationMinutes / 60} hours</span>
                  <span className="badge">{formatPoints(current.exam.totalPoints)} marks</span>
                </div>
                <h2 style={{ marginBottom: 4 }}>{current.exam.title}</h2>
                <p className="muted mt-0" style={{ marginBottom: 10 }}>
                  {current.exam.company} · {current.exam.summary}
                </p>
                {current.status === 'in-progress' && (
                  <p className="small muted" style={{ margin: 0 }}>
                    {(() => {
                      const part = examProgress(current.exam, answersFor(current.exam));
                      return `${part.answered} of ${part.total} answer fields completed. Your draft is saved as you type.`;
                    })()}
                  </p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate({ name: 'exam', examId: current.exam.id })}
              >
                {current.status === 'in-progress' ? 'Continue this exam' : 'Start Exam'} <IconArrow />
              </button>
            </div>
          </div>
        </section>
      ) : (
        <section className="panel panel-pad mb">
          <h2>All ten mock exams completed</h2>
          <p className="muted mt-0" style={{ marginBottom: 14 }}>
            You can revisit any attempt, review its solutions and retake it at any time.
          </p>
          <button type="button" className="btn btn-primary" onClick={() => navigate({ name: 'progress' })}>
            Open progress
          </button>
        </section>
      )}

      <section className="stat-grid mb">
        <div className="stat">
          <div className="label">Exams completed</div>
          <div className="value">
            {summary.completed} <span className="muted" style={{ fontSize: '1rem' }}>/ {summary.total}</span>
          </div>
        </div>
        <div className="stat">
          <div className="label">Latest score</div>
          <div className="value">
            {summary.latestScore !== null ? `${formatPoints(summary.latestScore)} / 20` : '—'}
          </div>
          <div className="tiny muted">{summary.latestExamTitle ?? 'No attempt graded yet'}</div>
        </div>
        <div className="stat">
          <div className="label">Next available mock exam</div>
          <div className="value" style={{ fontSize: '1.05rem' }}>{summary.nextExamTitle ?? 'All unlocked'}</div>
          <div className="tiny muted">Solutions unlocked: {summary.solutionUnlocked}</div>
        </div>
        <div className="stat">
          <div className="label">Average score</div>
          <div className="value">{summary.averageScore !== null ? `${formatPoints(summary.averageScore)} / 20` : '—'}</div>
          <div className="tiny muted">
            {summary.bestScore !== null ? `Best: ${formatPoints(summary.bestScore)} / 20` : 'No attempt graded yet'}
          </div>
        </div>
      </section>

      <h2 className="mb-sm">All mock exams</h2>
      <div className="exam-grid">
        {states.map((state) => {
          const attempt = progress.attempts[state.exam.id];
          const inProgress = state.status === 'in-progress';
          return (
            <button
              key={state.exam.id}
              type="button"
              className={`exam-card${current?.exam.id === state.exam.id ? ' is-current' : ''}`}
              disabled={state.status === 'locked'}
              onClick={() => navigate({ name: 'exam', examId: state.exam.id })}
            >
              <div className="card-top">
                <span className="card-title">{state.exam.title}</span>
                <StatusBadge status={state.status} score={state.score} />
              </div>
              <div className="card-sub">
                {state.exam.company} · {state.exam.topics.slice(0, 2).join(' · ')}
              </div>
              {state.status === 'completed' && attempt?.submittedAt && (
                <div className="tiny muted">Submitted {formatLocalDateTime(attempt.submittedAt)}</div>
              )}
              {inProgress && <div className="tiny muted">Draft in progress</div>}
              {state.status === 'locked' && (
                <div className="lock-note">
                  <IconLock /> Opens after the previous exam has been submitted
                </div>
              )}
              {state.status === 'available' && <div className="tiny muted">{state.exam.summary}</div>}
            </button>
          );
        })}
      </div>
    </>
  );
}
