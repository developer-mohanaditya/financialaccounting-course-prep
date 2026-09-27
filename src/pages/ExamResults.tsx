import { useStudio } from '../state/StudioContext';
import { StatusBadge } from '../components/StatusBadge';
import { IconCheck, IconCross } from '../components/Icons';
import { formatDuration, formatLocalDateTime, formatPoints } from '../lib/format';
import type { MockExam, QuestionResult } from '../lib/types';


function verdict(result: QuestionResult): { label: string; className: string } {
  if (result.awarded >= result.possible - 0.0001) return { label: 'Full marks', className: 'badge-correct' };
  if (result.awarded > 0) return { label: 'Partly correct', className: 'badge-partial' };
  if (result.kind === 'entry' && (result.submitted ?? []).length === 0)
    return { label: 'Not attempted', className: '' };
  if (result.kind === 'mcq' && result.wasUnknown) return { label: 'Don’t know · no penalty', className: '' };
  if (result.kind === 'mcq' && !result.selectedKey) return { label: 'Not answered', className: '' };
  return { label: 'Incorrect', className: 'badge-wrong' };
}

export function ExamResults({ exam }: { exam: MockExam }) {
  const { attemptFor, states, navigate, progress } = useStudio();
  const attempt = attemptFor(exam.id);
  const result = attempt?.result ?? null;
  const state = states.find((entry) => entry.exam.id === exam.id)!;
  const nextExam = states[exam.number]?.exam ?? null;

  if (!attempt || !result) {
    return (
      <section className="panel panel-pad">
        <h1>{exam.title}</h1>
        <p className="lede">This exam has not been submitted yet, so there is no grade to show.</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate({ name: 'exam', examId: exam.id })}>
          Open the exam
        </button>
      </section>
    );
  }

  const byId = new Map(result.questions.map((entry) => [entry.questionId, entry]));

  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">Results · {exam.company}</p>
          <h1>{exam.title}</h1>
          <p className="lede mt-0">
            Graded on {formatLocalDateTime(attempt.submittedAt)} · time used {formatDuration(attempt.elapsedMs)}
          </p>
        </div>
        <StatusBadge status={state.status} score={state.score} />
      </header>

      <section className="panel panel-pad mb">
        <div className="row gap-lg wrap" style={{ alignItems: 'flex-end' }}>
          <div>
            <div className="eyebrow">Total score</div>
            <div className="score-figure">
              {formatPoints(result.awarded)} <span className="denom">/ {formatPoints(result.possible)}</span>
            </div>
          </div>
          <div>
            <div className="eyebrow">Percentage</div>
            <div className="score-figure" style={{ fontSize: '1.7rem' }}>{result.percentage.toFixed(1)}%</div>
          </div>
          <div className="grow" />
          <div className="row gap-sm wrap">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate({ name: 'review', examId: exam.id })}
            >
              Open solutions
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate({ name: 'exam', examId: exam.id })}
            >
              Exam overview
            </button>
          </div>
        </div>
      </section>

      {nextExam && (
        <div className="callout mb">
          {nextExam.title} is now unlocked. Head to the dashboard whenever you are ready to start it.
        </div>
      )}
      {!nextExam && (
        <div className="callout mb">All ten mock exams are now unlocked. You can revisit or retake any of them.</div>
      )}

      <section className="panel mb">
        <div className="panel-head">
          <h2>Score by section</h2>
        </div>
        <div className="table-scroll">
          <table className="figures">
            <thead>
              <tr>
                <th>Section</th>
                <th className="num">Score</th>
                <th className="num">Marks available</th>
                <th className="num">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {result.sections.map((section) => {
                const pct = section.possible > 0 ? (section.awarded / section.possible) * 100 : 0;
                return (
                  <tr key={section.sectionId}>
                    <td>
                      <strong>{section.label}</strong> · {section.title}
                    </td>
                    <td className="num">{formatPoints(section.awarded)}</td>
                    <td className="num">{formatPoints(section.possible)}</td>
                    <td className="num">{pct.toFixed(1)}%</td>
                  </tr>
                );
              })}
              <tr className="emphasis">
                <td>Total</td>
                <td className="num">{formatPoints(result.awarded)}</td>
                <td className="num">{formatPoints(result.possible)}</td>
                <td className="num">{result.percentage.toFixed(1)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="panel-pad" style={{ borderTop: '1px solid var(--line)' }}>
          <p className="small muted" style={{ margin: 0 }}>
            Part One is marked +0.50 per correct answer, −0.25 per incorrect answer and 0 for “Don’t know”, as on the
            paper. Part Two is marked per correct entry line or schedule cell.
          </p>
        </div>
      </section>

      <section className="paper">
        <div className="section-band">
          <div className="label">Part One</div>
          <h3>Questions — answer by answer</h3>
        </div>
        <div className="panel-pad stack gap-sm">
          {exam.sections[0].questionIds.map((id) => {
            const question = exam.questions[id];
            const entry = byId.get(id);
            if (!entry || question.kind !== 'mcq') return null;
            const selected = entry.selectedKey
              ? question.options.find((option) => option.key === entry.selectedKey)
              : null;
            const correct = question.options.find((option) => option.key === entry.correctKey);
            const mark = verdict(entry);
            return (
              <div key={id} className={`review-row ${entry.awarded > 0.0001 ? 'is-correct' : 'is-wrong'}`}>
                <span className="rk nowrap">Q{question.number}</span>
                <div className="rv">
                  <div style={{ fontWeight: 550 }}>{question.prompt}</div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    Your answer: {selected ? selected.label : '— none —'}
                  </div>
                  {entry.correctKey !== entry.selectedKey && (
                    <div className="small">
                      Key: {correct?.label} <span className="muted">({correct?.key})</span>
                    </div>
                  )}
                  <div className="tiny muted" style={{ marginTop: 4 }}>
                    {question.topic}
                  </div>
                </div>
                <div className="stack gap-xs" style={{ alignItems: 'flex-end' }}>
                  <span className="badge nowrap">
                    {entry.awarded > 0 ? <IconCheck /> : <IconCross />} {formatPoints(entry.awarded)}
                  </span>
                  <span className={`badge ${mark.className}`}>{mark.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="paper mt">
        <div className="section-band">
          <div className="label">Part Two</div>
          <h3>{exam.intro.heading} — table by table</h3>
        </div>
        <div className="panel-pad stack gap-sm">
          {exam.sections[1].questionIds.map((id) => {
            const question = exam.questions[id];
            const entry = byId.get(id);
            if (!entry) return null;
            const mark = verdict(entry);
            const wrongLines = entry.lineFeedback?.filter((line) => !line.lineCorrect).length ?? 0;
            const wrongCells = entry.cellFeedback?.filter((cell) => !cell.correct).length ?? 0;
            /** Lines where the learner submitted nothing at all on the script. */
            const blankLines =
              entry.lineFeedback?.filter((line) => line.cells.every((cell) => cell.given.trim() === '')).length ?? 0;
            return (
              <div key={id} className={`review-row ${entry.awarded > 0.0001 ? 'is-correct' : 'is-wrong'}`}>
                <span className="rk nowrap">Item {question.number}</span>
                <div className="rv">
                  <div style={{ fontWeight: 550 }}>{question.topic}</div>
                  <div className="small muted" style={{ marginTop: 4 }}>
                    {entry.kind === 'entry'
                      ? `${(question.kind === 'entry' ? question.lines.length : 0) - wrongLines} of ${question.kind === 'entry' ? question.lines.length : 0} lines correct`
                      : `${(entry.cellFeedback?.length ?? 0) - wrongCells} of ${entry.cellFeedback?.length ?? 0} cells correct`}
                  </div>
                  {entry.kind === 'entry' && blankLines > 0 && (
                    <div className="tiny muted" style={{ marginTop: 2 }}>
                      {blankLines} line{blankLines === 1 ? '' : 's'} left blank — blank lines are not marked.
                    </div>
                  )}
                </div>
                <div className="stack gap-xs" style={{ alignItems: 'flex-end' }}>
                  <span className="badge nowrap">
                    {formatPoints(entry.awarded)} / {formatPoints(entry.possible)}
                  </span>
                  <span className={`badge ${mark.className}`}>{mark.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="row gap-sm wrap mt" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn btn-outline" onClick={() => navigate({ name: 'dashboard' })}>
          Back to dashboard
        </button>
        <span className="tiny muted">
          Completed exams recorded: {Object.values(progress.attempts).filter((entry) => entry.result).length} of{' '}
          {states.length}
        </span>
      </div>
    </>
  );
}
