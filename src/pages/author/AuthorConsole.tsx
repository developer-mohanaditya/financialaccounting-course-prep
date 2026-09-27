import { useState } from 'react';
import { useStudio, type Route } from '../../state/StudioContext';
import { leaveAuthorRoute } from '../../lib/author';
import { useAuthorPapers } from '../../lib/useAuthorPapers';
import { formatPoints } from '../../lib/format';
import { AuthorExam, type Tab } from './AuthorExam';
import { IconCheck, IconLock } from '../../components/Icons';

/**
 * Content console.
 *
 * Reachable only by its URL, listed nowhere, and linked from nowhere in the study
 * interface. Every paper is readable here in full — question paper, answer key and
 * marking notes — without an attempt, a grade or an unlocked sequence.
 *
 * The papers are fetched from the server rather than read from the bundle: the
 * study interface's own copy is redacted, and the key exists nowhere in this
 * browser until the server chooses to send it.
 */
export function AuthorConsole() {
  const { navigate, revokeAuthor, author, signedIn, signIn } = useStudio();
  const { papers: exams, loading, error } = useAuthorPapers();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('paper');

  if (error) {
    return (
      <div className="console">
        <header className="console-bar">
          <div className="console-bar-inner">
            <div className="grow">
              <div className="tb-title">Content review</div>
              <div className="tb-meta">{author ? author.email : ''}</div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm" onClick={revokeAuthor}>
              End session
            </button>
          </div>
        </header>
        <div className="console-pad">
          <div className="callout callout-danger" role="alert">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (loading && exams.length === 0) {
    return (
      <div className="console">
        <div className="console-pad">
          <p className="muted small">Loading the papers…</p>
        </div>
      </div>
    );
  }

  /**
   * Leave the console and land on an ordinary studio page. Studio pages need a
   * session, so the first jump out of the console opens a guest one rather than
   * dropping the reader on the start screen.
   */
  const openInStudio = (route: Route) => {
    if (!signedIn) signIn({ kind: 'guest', label: 'Guest', startedAt: new Date().toISOString() });
    navigate(route);
    leaveAuthorRoute();
  };

  const selected = selectedId ? exams.find((exam) => exam.id === selectedId) ?? null : null;

  if (selected) {
    return (
      <AuthorExam
        exam={selected}
        tab={tab}
        onTabChange={setTab}
        onBack={() => setSelectedId(null)}
        onOpenPaper={() => openInStudio({ name: 'exam', examId: selected.id, take: true })}
      />
    );
  }

  const mcqCount = exams.reduce(
    (sum, exam) => sum + exam.sections.filter((section) => section.id === 'part-one').flatMap((s) => s.questionIds).length,
    0,
  );
  const caseCount = exams.reduce(
    (sum, exam) =>
      sum + exam.sections.filter((section) => section.id !== 'part-one').flatMap((s) => s.questionIds).length,
    0,
  );
  const totalMarks = exams.reduce((sum, exam) => sum + exam.totalPoints, 0);

  return (
    <div className="console">
      <header className="console-bar">
        <div className="console-bar-inner">
          <div className="grow">
            <div className="tb-title">Content review</div>
            <div className="tb-meta">
              Every paper, answer key and marking note, readable without an attempt
              {author ? ` · ${author.email}` : ''}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => openInStudio({ name: 'dashboard' })}
          >
            Study workspace
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={revokeAuthor}>
            End session
          </button>
        </div>
      </header>

      <div className="console-pad">
        <div className="stat-grid mb">
          <div className="stat">
            <div className="label">Papers</div>
            <div className="value">{exams.length}</div>
          </div>
          <div className="stat">
            <div className="label">Multiple-choice questions</div>
            <div className="value">{mcqCount}</div>
          </div>
          <div className="stat">
            <div className="label">Case transactions &amp; tables</div>
            <div className="value">{caseCount}</div>
          </div>
          <div className="stat">
            <div className="label">Marks across the set</div>
            <div className="value">{formatPoints(totalMarks)}</div>
          </div>
        </div>

        <section className="panel">
          <div className="panel-pad">
            <h3>The ten papers</h3>
            <p className="muted small mt-0" style={{ marginBottom: 0 }}>
              Open a paper to read its question sheet, its answer key and the notes behind every mark.
            </p>
          </div>
          <div className="table-scroll">
            <table className="figures">
              <thead>
                <tr>
                  <th style={{ width: 118 }}>Paper</th>
                  <th>Company &amp; case</th>
                  <th>Topics</th>
                  <th className="num" style={{ width: 92 }}>
                    Questions
                  </th>
                  <th className="num" style={{ width: 84 }}>
                    Marks
                  </th>
                  <th style={{ width: 210 }} />
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const mcqs = exam.sections
                    .filter((section) => section.id === 'part-one')
                    .flatMap((section) => section.questionIds).length;
                  const items = exam.sections
                    .filter((section) => section.id !== 'part-one')
                    .flatMap((section) => section.questionIds).length;
                  return (
                    <tr key={exam.id}>
                      <td>
                        <strong>{exam.title}</strong>
                        <div className="tiny muted">{exam.durationMinutes} minutes</div>
                      </td>
                      <td>
                        {exam.company}
                        <div className="tiny muted">{exam.intro.heading}</div>
                      </td>
                      <td className="small muted">{exam.topics.join(' · ')}</td>
                      <td className="num">
                        {mcqs} + {items}
                      </td>
                      <td className="num">{formatPoints(exam.totalPoints)}</td>
                      <td>
                        <div className="row gap-xs wrap" style={{ justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => setSelectedId(exam.id)}
                          >
                            Open paper
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => openInStudio({ name: 'review', examId: exam.id })}
                          >
                            <IconLock /> Solutions
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="callout callout-quiet small mt">
          <span className="row gap-xs">
            <IconCheck size={14} /> Nothing here appears in the study workspace: no link, no menu entry, no label.
          </span>
        </div>
      </div>
    </div>
  );
}
