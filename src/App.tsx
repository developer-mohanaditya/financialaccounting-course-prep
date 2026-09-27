import { useEffect, useState } from 'react';
import { useStudio } from './state/StudioContext';
import { Sidebar } from './components/Sidebar';
import { LoginGate } from './pages/LoginGate';
import { Dashboard } from './pages/Dashboard';
import { ExamOverview } from './pages/ExamOverview';
import { ExamRunner } from './pages/ExamRunner';
import { ExamResults } from './pages/ExamResults';
import { ExamReview } from './pages/ExamReview';
import { ProgressPage } from './pages/ProgressPage';
import { SettingsPage } from './pages/SettingsPage';
import { AuthorConsole } from './pages/author/AuthorConsole';
import { AuthorGate } from './pages/author/AuthorGate';
import { authorConsoleEnabled, useAuthorRoute } from './lib/author';
import { IconMenu } from './components/Icons';

export function App() {
  const { ready, signedIn, route, exams, states, progress, navigate, authorMode } = useStudio();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const consoleRoute = useAuthorRoute();

  // Apply the appearance preference to the document root.
  useEffect(() => {
    document.documentElement.dataset.theme = progress.theme;
  }, [progress.theme]);

  // The runner lays out its own full-width toolbar, so the sidebar collapses on mobile only.
  const exam = 'examId' in route ? exams.find((entry) => entry.id === route.examId) ?? null : null;
  const examState = exam ? states.find((entry) => entry.exam.id === exam.id) ?? null : null;

  /**
   * Pages that must not be reachable: an unknown paper, a paper still locked by the
   * sequence, or solutions before that paper has been submitted and graded.
   */
  const blocked =
    !authorMode &&
    'examId' in route &&
    (!exam ||
      examState?.status === 'locked' ||
      ((route.name === 'results' || route.name === 'review') && !examState?.attempt?.result));

  useEffect(() => {
    if (ready && signedIn && blocked) navigate({ name: 'dashboard' });
  }, [ready, signedIn, blocked, navigate]);

  if (!ready) {
    return (
      <div className="content">
        <p className="muted small">Preparing your workspace…</p>
      </div>
    );
  }

  // The content console stands on its own: it needs no study session, and the
  // study interface never points at it. A build made without author credentials
  // has no console to reach, so the address means nothing there.
  if (authorConsoleEnabled && consoleRoute) {
    return authorMode ? <AuthorConsole /> : <AuthorGate />;
  }

  if (!signedIn) {
    return <LoginGate />;
  }

  if (blocked) {
    return (
      <div className="shell">
        <div className="main">
          <div className="content content-wide">
            <section className="panel panel-pad">
              <h1>This page is not available</h1>
              <p className="lede">
                The paper you asked for is either locked, or its solutions are still sealed because it has not
                been submitted and graded yet. Taking you back to your practice.
              </p>
              <button type="button" className="btn btn-outline" onClick={() => navigate({ name: 'dashboard' })}>
                Back to dashboard
              </button>
            </section>
          </div>
        </div>
      </div>
    );
  }

  const scrollTop = () => window.scrollTo({ top: 0 });

  return (
    <div className={`shell${drawerOpen ? ' drawer-open' : ''}`}>
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <div className="main">
        <div className="mobile-bar">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            style={{ color: '#fff' }}
            aria-label="Open navigation"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
          >
            <IconMenu />
          </button>
          <span className="name">FA Mock Exam Studio</span>
        </div>

        {route.name === 'exam' && exam && route.take ? (
          <ExamRunner exam={exam} />
        ) : (
          <div className="content content-wide">
            {route.name === 'dashboard' && <Dashboard />}
            {route.name === 'progress' && <ProgressPage />}
            {route.name === 'settings' && <SettingsPage />}
            {route.name === 'exam' && exam && !route.take && <ExamOverview exam={exam} />}
            {route.name === 'results' && exam && <ExamResults exam={exam} />}
            {route.name === 'review' && exam && <ExamReview exam={exam} />}
          </div>
        )}

        <button
          type="button"
          className="btn btn-outline btn-sm"
          style={{ position: 'fixed', right: 18, bottom: 18, opacity: 0.9 }}
          onClick={scrollTop}
          aria-label="Scroll to top"
        >
          ↑ Top
        </button>
      </div>
    </div>
  );
}
