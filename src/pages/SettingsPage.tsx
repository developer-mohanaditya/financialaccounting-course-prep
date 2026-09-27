import { useState } from 'react';
import { useStudio } from '../state/StudioContext';
import { Dialog } from '../components/Dialog';
import { formatLocalDateTime } from '../lib/format';
import type { ProgressState } from '../lib/types';

const THEMES: { value: ProgressState['theme']; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Follow the appearance of your device' },
  { value: 'light', label: 'Light', hint: 'Bright surfaces, dark text' },
  { value: 'dark', label: 'Dark', hint: 'Deep navy surfaces for evening study' },
];

export function SettingsPage() {
  const { progress, setTheme, resetProgress, storageOk, signOut, summary } = useStudio();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <header className="page-title">
        <div>
          <p className="eyebrow">Preferences</p>
          <h1>Settings</h1>
          <p className="lede mt-0">Session details, appearance and the controls for the study record held in this browser.</p>
        </div>
      </header>

      <section className="panel mb">
        <div className="panel-head">
          <h2>Current session</h2>
        </div>
        <div className="panel-pad stack gap-sm">
          <div className="row gap wrap" style={{ justifyContent: 'space-between' }}>
            <div>
              <div className="field-label">Signed in as</div>
              <div style={{ fontWeight: 560 }}>
                {progress.session ? progress.session.label : 'Not signed in'}
              </div>
              <div className="tiny muted">
                {progress.session?.kind === 'guest' ? 'Guest session' : 'Email session'} · started{' '}
                {progress.session ? formatLocalDateTime(progress.session.startedAt) : '—'}
              </div>
            </div>
            <button type="button" className="btn btn-outline" onClick={signOut}>
              Return to start screen
            </button>
          </div>
          <p className="tiny muted" style={{ margin: 0 }}>
            Signing out keeps your answers and scores in this browser; the start screen simply asks how you would like to
            be identified next time.
          </p>
        </div>
      </section>

      <section className="panel mb">
        <div className="panel-head">
          <h2>Appearance</h2>
        </div>
        <div className="panel-pad stack gap-sm">
          <div className="row gap-sm wrap" role="radiogroup" aria-label="Appearance">
            {THEMES.map((theme) => (
              <label
                key={theme.value}
                className={`mcq-option${progress.theme === theme.value ? ' is-selected' : ''}`}
                style={{ flex: '1 1 200px' }}
              >
                <input
                  type="radio"
                  name="theme"
                  value={theme.value}
                  checked={progress.theme === theme.value}
                  onChange={() => setTheme(theme.value)}
                />
                <span className="grow">
                  <span style={{ fontWeight: 560, display: 'block' }}>{theme.label}</span>
                  <span className="tiny muted">{theme.hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="panel mb">
        <div className="panel-head">
          <h2>Study record</h2>
        </div>
        <div className="panel-pad stack gap-sm">
          <div className="stat-grid">
            <div className="stat">
              <div className="label">Exams completed</div>
              <div className="value">{summary.completed}</div>
            </div>
            <div className="stat">
              <div className="label">Solutions unlocked</div>
              <div className="value">{summary.solutionUnlocked}</div>
            </div>
            <div className="stat">
              <div className="label">Storage in this browser</div>
              <div className="value" style={{ fontSize: '1rem' }}>
                {storageOk ? 'Available' : 'Unavailable'}
              </div>
            </div>
          </div>
          {!storageOk && (
            <div className="callout">
              This browser is blocking local storage, so answers and scores will only last for the current visit.
            </div>
          )}
          <div className="row gap-sm wrap" style={{ justifyContent: 'space-between' }}>
            <p className="small muted" style={{ margin: 0 }}>
              Reset progress clears the study progress stored in this browser.
            </p>
            <button type="button" className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
              Reset progress
            </button>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Privacy</h2>
        </div>
        <div className="panel-pad">
          <p className="small" style={{ margin: 0 }}>
            Your progress is stored only in this browser.
          </p>
        </div>
      </section>

      <Dialog open={confirmOpen} title="Reset your study progress?" onDismiss={() => setConfirmOpen(false)}>
        <p className="muted small">
          This clears the study progress stored in this browser: every answer, score, submission date and unlock. The
          studio returns to the start screen.
        </p>
        <div className="row gap-sm wrap" style={{ justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-outline" onClick={() => setConfirmOpen(false)}>
            Keep my progress
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              resetProgress();
              setConfirmOpen(false);
            }}
          >
            Reset progress
          </button>
        </div>
      </Dialog>
    </>
  );
}
