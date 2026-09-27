import { useEffect, useMemo, useState } from 'react';
import { useStudio } from '../state/StudioContext';
import { Dialog } from '../components/Dialog';
import { EntryTableBlock, McqBlock, ScheduleTableBlock } from '../components/QuestionBlocks';
import { ChartOfAccountsAnnex } from '../components/ChartOfAccounts';
import { IconClock } from '../components/Icons';
import { examProgress, sectionProgress } from '../lib/grading';
import { formatDuration } from '../lib/format';
import type { AttemptRecord, MockExam } from '../lib/types';

/**
 * The countdown keeps its own one-second tick, so the paper itself is only
 * re-rendered when an answer actually changes.
 */
function ExamClock({ exam, attempt }: { exam: MockExam; attempt: AttemptRecord | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const handle = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(handle);
  }, []);

  const elapsed =
    (attempt?.elapsedMs ?? 0) + (attempt?.lastRunStartedAt ? now - Date.parse(attempt.lastRunStartedAt) : 0);
  const remainingMs = exam.durationMinutes * 60_000 - elapsed;

  return (
    <span className={`timer${remainingMs < 0 ? ' is-over' : ''}`}>
      <IconClock /> {remainingMs < 0 ? '+' : ''}
      {formatDuration(Math.abs(remainingMs))}
    </span>
  );
}

export function ExamRunner({ exam }: { exam: MockExam }) {
  const {
    answersFor,
    attemptFor,
    navigate,
    setMcqAnswer,
    setEntryRow,
    addEntryRow,
    clearEntryRow,
    setScheduleCell,
    ensureAttempt,
    pauseTimer,
    resumeTimer,
    submitExam,
  } = useStudio();

  const attempt = attemptFor(exam.id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [flash, setFlash] = useState(false);
  const [showAnnex, setShowAnnex] = useState(false);

  // One answer sheet per stored attempt: a new object only when the attempt itself
  // changes, so the acknowledgement effect below is not restarted on every render.
  const answers = useMemo(() => answersFor(exam), [answersFor, exam, attempt]);

  // Start (or resume) the attempt and its clock when the runner mounts.
  useEffect(() => {
    ensureAttempt(exam);
    resumeTimer(exam.id);
    return () => {
      pauseTimer(exam.id);
    };
  }, [exam, ensureAttempt, resumeTimer, pauseTimer]);

  // The clock stops while the tab is in the background.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden') pauseTimer(exam.id);
      else resumeTimer(exam.id);
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [exam.id, pauseTimer, resumeTimer]);

  // Visual acknowledgement that an answer was written to local storage.
  useEffect(() => {
    setFlash(true);
    const handle = window.setTimeout(() => setFlash(false), 700);
    return () => window.clearTimeout(handle);
  }, [answers]);

  const progress = useMemo(() => examProgress(exam, answers), [exam, answers]);
  const elapsedMs =
    (attempt?.elapsedMs ?? 0) +
    (attempt?.lastRunStartedAt ? Date.now() - Date.parse(attempt.lastRunStartedAt) : 0);

  const jumpTo = (id: string) => {
    const node = document.getElementById(`question-${id}`);
    node?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleSubmit = () => {
    submitExam(exam);
    setConfirmOpen(false);
    navigate({ name: 'results', examId: exam.id });
  };

  return (
    <>
      <div className="exam-toolbar">
        <div className="exam-toolbar-inner">
          <div className="grow" style={{ minWidth: 160 }}>
            <div className="tb-title">{exam.title}</div>
            <div className="tb-meta">
              {exam.company} · {exam.totalPoints.toFixed(2)} marks
            </div>
          </div>

          <div className="tb-progress">
            <span className="tb-meta nowrap">
              {progress.answered} / {progress.total} fields
            </span>
            <span className="meter" aria-hidden="true">
              <span style={{ width: `${progress.total ? (progress.answered / progress.total) * 100 : 0}%` }} />
            </span>
          </div>

          <ExamClock exam={exam} attempt={attempt} />

          <span className={`save-status${flash ? ' is-saving' : ''}`}>
            <span className="dot" /> Saved locally
          </span>

          <button type="button" className="btn btn-primary" onClick={() => setConfirmOpen(true)}>
            Submit exam
          </button>
        </div>
      </div>

      <div className="content content-wide">
        <div className="row gap-sm wrap mb" style={{ justifyContent: 'space-between' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => navigate({ name: 'exam', examId: exam.id })}>
            ← Exam overview
          </button>
          <div className="row gap-sm wrap">
            <span className="tiny muted">
              Time used {formatDuration(elapsedMs)} of {exam.durationMinutes} minutes · answers save automatically
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              aria-expanded={showAnnex}
              onClick={() => setShowAnnex((value) => !value)}
            >
              {showAnnex ? 'Hide chart of accounts' : 'Chart of accounts (annex)'}
            </button>
          </div>
        </div>

        {showAnnex && (
          <section className="panel panel-pad mb" aria-label="Annex — chart of accounts">
            <div className="row gap wrap" style={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 style={{ marginBottom: 0 }}>Annex — chart of accounts</h3>
              <span className="tiny muted">Detachable annex, as on the paper</span>
            </div>
            <div className="mt-sm">
              <ChartOfAccountsAnnex />
            </div>
          </section>
        )}

        {exam.sections.map((section) => {
          const part = sectionProgress(section, exam.questions, answers);
          return (
            <section className="paper mb" key={section.id} aria-label={section.label}>
              <div className="section-band">
                <div className="label">{section.label}</div>
                <h3>
                  {section.title} · {section.points.toFixed(2)} marks
                </h3>
              </div>

              <div className="section-instructions">
                <ul>
                  {section.instructions.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div className="section-index" aria-label={`${section.label} navigation`}>
                <span className="tiny muted nowrap" style={{ alignSelf: 'center', marginRight: 6 }}>
                  {part.answered}/{part.total} answered
                </span>
                {section.questionIds.map((id) => {
                  const question = exam.questions[id];
                  const itemPart = sectionProgress({ ...section, questionIds: [id] }, exam.questions, answers);
                  const done = itemPart.total > 0 && itemPart.answered === itemPart.total;
                  return (
                    <button
                      key={id}
                      type="button"
                      className={`index-chip${done ? ' is-answered' : ''}`}
                      onClick={() => jumpTo(id)}
                      aria-label={`Go to ${section.label} question ${question.number}`}
                    >
                      {question.number}
                    </button>
                  );
                })}
              </div>

              {section.questionIds.map((id) => {
                const question = exam.questions[id];
                return (
                  <div key={id} id={`question-${id}`}>
                    {question.kind === 'mcq' && (
                      <McqBlock
                        question={question}
                        selected={answers.mcq?.[id]}
                        onSelect={(key) => setMcqAnswer(exam.id, id, key)}
                      />
                    )}
                    {question.kind === 'entry' && (
                      <EntryTableBlock
                        question={question}
                        rows={answers.entries?.[id] ?? []}
                        onChange={(index, patch) => setEntryRow(exam.id, id, index, patch)}
                        onAdd={() => addEntryRow(exam.id, id)}
                        onClear={(index) => clearEntryRow(exam.id, id, index, question.lines.length)}
                      />
                    )}
                    {question.kind === 'schedule' && (
                      <ScheduleTableBlock
                        question={question}
                        values={answers.schedules?.[id] ?? {}}
                        onChange={(key, value) => setScheduleCell(exam.id, id, key, value)}
                      />
                    )}
                  </div>
                );
              })}
            </section>
          );
        })}

        <section className="panel panel-pad">
          <div className="row gap wrap" style={{ justifyContent: 'space-between' }}>
            <div className="grow">
              <h3 style={{ marginBottom: 4 }}>
                {progress.answered} of {progress.total} answer fields completed
              </h3>
              <p className="muted mt-0" style={{ marginBottom: 0 }}>
                Submit the exam to receive your grade and unlock the solutions for this paper.
              </p>
            </div>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setConfirmOpen(true)}>
              Submit exam
            </button>
          </div>
        </section>
      </div>

      <Dialog open={confirmOpen} title="Submit your exam for grading?" onDismiss={() => setConfirmOpen(false)}>
        <p className="muted small">
          {progress.answered} of {progress.total} answer fields are completed. Once submitted, the exam is graded
          immediately and the solutions for this paper become available.
        </p>
        <div className="row gap-sm wrap" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => setConfirmOpen(false)}>
            Continue editing
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit}>
            Submit exam
          </button>
        </div>
      </Dialog>
    </>
  );
}
