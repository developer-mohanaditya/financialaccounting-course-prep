import { useRef, useState } from 'react';
import { useStudio } from '../state/StudioContext';
import { Dialog } from '../components/Dialog';
import { formatLocalDateTime } from '../lib/format';
import { exportProgress } from '../lib/storage';
import type { SyncState } from '../lib/useSync';
import type { ProgressState } from '../lib/types';

const THEMES: { value: ProgressState['theme']; label: string; hint: string }[] = [
  { value: 'system', label: 'System', hint: 'Follow the appearance of your device' },
  { value: 'light', label: 'Light', hint: 'Bright surfaces, dark text' },
  { value: 'dark', label: 'Dark', hint: 'Deep navy surfaces for evening study' },
];

const SYNC_LABEL: Record<SyncState, string> = {
  idle: 'Not started',
  syncing: 'Saving…',
  synced: 'Up to date',
  offline: 'Waiting for a connection',
  conflict: 'Combining with another device',
};

export function SettingsPage() {
  const {
    progress,
    setTheme,
    resetProgress,
    restoreProgress,
    storageOk,
    signOut,
    summary,
    auth,
    sync,
  } = useStudio();
  const account = auth.isAuthenticated;
  const accountEmail = auth.email;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [backup, setBackup] = useState<string | null>(null);
  const [backupNote, setBackupNote] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  /**
   * Copy the record to the clipboard, falling back to a selectable box where the
   * clipboard is blocked — some browsers refuse it outside a secure context, and
   * a backup that silently does nothing is worse than no backup at all.
   */
  const copyBackup = async () => {
    const text = exportProgress(progress);
    setBackup(text);
    try {
      await navigator.clipboard.writeText(text);
      setBackupNote('Copied. Paste it somewhere you will find it again.');
    } catch {
      setBackupNote('Your browser would not copy it automatically — select the text below and copy it by hand.');
    }
  };

  const downloadBackup = () => {
    const text = exportProgress(progress);
    setBackup(text);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fa-mock-exam-progress-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupNote('Downloaded. Keep the file somewhere safe.');
  };

  const importFromFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    setBackupNote(
      restoreProgress(text)
        ? 'Restored. Your answers and scores are back.'
        : 'That file could not be read as a backup, so nothing was changed.',
    );
  };

  const importFromText = (text: string) => {
    setBackupNote(
      restoreProgress(text)
        ? 'Restored. Your answers and scores are back.'
        : 'That text could not be read as a backup, so nothing was changed.',
    );
  };

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
              {accountEmail ?? (progress.session ? progress.session.label : 'Not signed in')}
            </div>
            <div className="tiny muted">
              {account ? 'Verified email' : progress.session?.kind === 'guest' ? 'Guest session' : 'Email session'} ·
              started {progress.session ? formatLocalDateTime(progress.session.startedAt) : '—'}
            </div>
          </div>
            <button type="button" className="btn btn-outline" onClick={signOut}>
              Return to start screen
            </button>
          </div>
          <p className="tiny muted" style={{ margin: 0 }}>
            {account
              ? 'Your work is saved to your account as well as this browser, so it follows you between devices. Signing out ends this browser’s session only.'
              : 'Signing out keeps your answers and scores in this browser; the start screen simply asks how you would like to be identified next time.'}
          </p>
          {account && (
            <div className="row gap-sm wrap" style={{ marginTop: 10, alignItems: 'center' }}>
              <span className={`badge${sync.state === 'synced' ? '' : ' badge-locked'}`}>
                {SYNC_LABEL[sync.state]}
              </span>
              <span className="tiny muted">
                {sync.lastSyncedAt
                  ? `Last saved ${formatLocalDateTime(new Date(sync.lastSyncedAt).toISOString())}`
                  : 'Nothing has been saved to the account yet.'}
              </span>
            </div>
          )}
          {account && sync.mergedPapers.length > 0 && (
            <div className="callout" role="status">
              Brought in {sync.mergedPapers.length} paper{sync.mergedPapers.length === 1 ? '' : 's'} saved from
              another device{sync.mergedPapers.length === 1 ? '' : 's'}.
            </div>
          )}
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
          <h2>Keep a backup</h2>
        </div>
        <div className="panel-pad stack gap-sm">
          <p className="small muted" style={{ margin: 0 }}>
            {account
              ? 'A backup is a small text file. Worth keeping even with an account — it is the one copy that cannot be lost to a bad merge, and it holds everything in one place.'
              : 'Your work lives in this browser alone, so clearing site data, switching device or private browsing will lose it. A backup is a small text file — save it before a long paper, and paste it back here if this browser is ever emptied.'}
          </p>
          <div className="row gap-sm wrap">
            <button type="button" className="btn btn-outline" onClick={copyBackup}>
              Copy my progress
            </button>
            <button type="button" className="btn btn-outline" onClick={downloadBackup}>
              Download as a file
            </button>
            <button type="button" className="btn btn-outline" onClick={() => fileInput.current?.click()}>
              Restore from a file
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json,.txt"
              className="visually-hidden-input"
              onChange={(event) => {
                void importFromFile(event.target.files?.[0]);
                event.target.value = '';
              }}
            />
          </div>
          {backupNote && (
            <div className="callout" role="status">
              {backupNote}
            </div>
          )}
          {backup && (
            <div className="stack gap-xs">
              <label className="field-label" htmlFor="backup-text">
                Your progress — copy this out
              </label>
              <textarea
                id="backup-text"
                className="backup-text"
                readOnly
                rows={8}
                value={backup}
                onFocus={(event) => event.currentTarget.select()}
              />
              <button
                type="button"
                className="btn btn-ghost btn-sm align-start"
                onClick={() => {
                  void importFromText(backup);
                }}
              >
                Restore from the text above
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>Privacy</h2>
        </div>
        <div className="panel-pad">
          <p className="small" style={{ margin: 0 }}>
            {account
              ? 'Your progress is stored in this browser and, so it can follow you between devices, on your account. A submitted answer sheet goes to the marking service, which keeps none of it. No password is ever set: signing in means proving you can read a code sent to your address.'
              : 'You are working as a guest, so your progress is stored only in this browser. Sign in with an email address to have it follow you between devices.'}
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
