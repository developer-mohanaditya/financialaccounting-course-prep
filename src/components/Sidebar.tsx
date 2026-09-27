import { useStudio } from '../state/StudioContext';
import type { Route } from '../state/StudioContext';
import { enterAuthorRoute } from '../lib/author';
import { IconChart, IconCross, IconGear, IconGrid, IconShield } from './Icons';
import { StatusIcon } from './StatusBadge';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { states, route, navigate, progress, authorMode } = useStudio();

  const go = (next: Route) => {
    navigate(next);
    onClose();
  };

  const isActive = (name: string, examId?: string) => {
    if (examId) {
      return 'examId' in route && route.examId === examId;
    }
    return route.name === name;
  };

  return (
    <>
      <aside className="sidebar" aria-label="Studio navigation">
        <div className="sidebar-brand">
          <span className="mark">Financial Accounting</span>
          <span className="name">FA Mock Exam Studio</span>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className="nav-item"
            aria-current={isActive('dashboard') ? 'page' : undefined}
            onClick={() => go({ name: 'dashboard' })}
          >
            <span className="nav-icon"><IconGrid /></span>
            <span className="nav-label">Dashboard</span>
          </button>

          <div className="sidebar-group-label">Mock exams</div>

          {states.map((state) => {
            const locked = state.status === 'locked';
            return (
              <button
                key={state.exam.id}
                type="button"
                className="nav-item"
                disabled={locked}
                aria-current={isActive('exam', state.exam.id) || isActive('results', state.exam.id) || isActive('review', state.exam.id) ? 'page' : undefined}
                onClick={() => go({ name: 'exam', examId: state.exam.id })}
                title={locked ? `${state.exam.title} is locked until the previous exam has been submitted` : state.exam.title}
              >
                <span className="nav-icon"><StatusIcon status={state.status} /></span>
                <span className="nav-label">{state.exam.title}</span>
                {state.score !== null && <span className="nav-meta">{state.score.toFixed(2)}</span>}
              </button>
            );
          })}

          <div className="sidebar-group-label">Study</div>

          <button
            type="button"
            className="nav-item"
            aria-current={isActive('progress') ? 'page' : undefined}
            onClick={() => go({ name: 'progress' })}
          >
            <span className="nav-icon"><IconChart /></span>
            <span className="nav-label">Progress</span>
          </button>

          <button
            type="button"
            className="nav-item"
            aria-current={isActive('settings') ? 'page' : undefined}
            onClick={() => go({ name: 'settings' })}
          >
            <span className="nav-icon"><IconGear /></span>
            <span className="nav-label">Settings</span>
          </button>

          {/* Rendered for the console session only, so learners never see this row. */}
          {authorMode && (
            <button
              type="button"
              className="nav-item"
              onClick={() => {
                enterAuthorRoute();
                onClose();
              }}
            >
              <span className="nav-icon">
                <IconShield size={15} />
              </span>
              <span className="nav-label">Content review</span>
            </button>
          )}
        </nav>

        <div className="sidebar-foot">
          <div>{progress.session?.label ?? 'Guest'}</div>
          <div className="tiny" style={{ marginTop: 4 }}>
            Progress saved in this browser
          </div>
        </div>

        <button
          type="button"
          className="nav-item"
          style={{ margin: '0 10px 14px', display: open ? 'flex' : 'none' }}
          onClick={onClose}
        >
          <span className="nav-icon"><IconCross /></span>
          <span className="nav-label">Close menu</span>
        </button>
      </aside>
      <div className="drawer-backdrop" onClick={onClose} aria-hidden="true" />
    </>
  );
}
