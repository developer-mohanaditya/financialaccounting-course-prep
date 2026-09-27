import { useStudio } from '../state/StudioContext';
import { StatusBadge } from '../components/StatusBadge';
import { formatDuration, formatLocalDateTime, formatPoints } from '../lib/format';
import { scoreSeries } from '../lib/progress';
import { examProgress } from '../lib/meters';

export function ProgressPage() {
  const { states, summary, navigate, answersFor } = useStudio();
  const series = scoreSeries(states);
  const maxValue = states[0]?.exam.totalPoints ?? 20;

  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">Study record</p>
          <h1>Progress</h1>
          <p className="lede mt-0">
            A summary of every attempt recorded in this browser, with the scores as they were graded.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={() => navigate({ name: 'settings' })}>
          Reset progress
        </button>
      </header>

      <section className="stat-grid mb">
        <div className="stat">
          <div className="label">Exams completed</div>
          <div className="value">
            {summary.completed} <span className="muted" style={{ fontSize: '1rem' }}>/ {summary.total}</span>
          </div>
          <div className="meter mt-sm">
            <span style={{ width: `${summary.total ? (summary.completed / summary.total) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="stat">
          <div className="label">Average score</div>
          <div className="value">{summary.averageScore !== null ? formatPoints(summary.averageScore) : '—'}</div>
        </div>
        <div className="stat">
          <div className="label">Best score</div>
          <div className="value">{summary.bestScore !== null ? formatPoints(summary.bestScore) : '—'}</div>
        </div>
        <div className="stat">
          <div className="label">Solutions unlocked</div>
          <div className="value">{summary.solutionUnlocked}</div>
        </div>
      </section>

      <section className="panel mb">
        <div className="panel-head">
          <h2>Score progression</h2>
          <span className="tiny muted">Out of {formatPoints(maxValue)} marks per exam</span>
        </div>
        <div className="panel-pad">
          <div className="chart" role="img" aria-label="Bar chart of scores achieved per mock exam">
            {series.map((point) => {
              const value = point.value;
              const height = value === null ? 3 : Math.max(3, (Math.abs(value) / maxValue) * 100);
              const negative = value !== null && value < 0;
              return (
                <div className="chart-col" key={point.label}>
                  <span className="chart-value">
                    {value === null ? '—' : formatPoints(value)}
                  </span>
                  <div
                    className={`chart-bar${value === null ? ' empty' : negative ? ' negative' : ''}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="chart-label">{point.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Attempts</h2>
        </div>
        <div className="table-scroll">
          <table className="figures">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Status</th>
                <th className="num">Score</th>
                <th className="num">Fields answered</th>
                <th>Completed</th>
                <th className="num">Time used</th>
                <th>Solutions</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {states.map((state) => {
                const attempt = state.attempt;
                const part = examProgress(state.exam, answersFor(state.exam));
                return (
                  <tr key={state.exam.id}>
                    <td>
                      <strong>{state.exam.title}</strong>
                      <div className="tiny muted">{state.exam.company}</div>
                    </td>
                    <td>
                      <StatusBadge status={state.status} />
                    </td>
                    <td className="num">
                      {state.score !== null ? `${formatPoints(state.score)} / 20` : '—'}
                    </td>
                    <td className="num">
                      {part.answered} / {part.total}
                    </td>
                    <td className="nowrap">
                      {attempt?.submittedAt ? formatLocalDateTime(attempt.submittedAt) : '—'}
                    </td>
                    <td className="num">{attempt ? formatDuration(attempt.elapsedMs) : '—'}</td>
                    <td>
                      {attempt?.result ? (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => navigate({ name: 'review', examId: state.exam.id })}
                        >
                          Unlocked
                        </button>
                      ) : (
                        <span className="tiny muted">Locked</span>
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={state.status === 'locked'}
                        onClick={() => navigate({ name: 'exam', examId: state.exam.id })}
                      >
                        {state.status === 'completed' ? 'Review' : state.status === 'locked' ? 'Locked' : 'Open'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
