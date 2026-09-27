/**
 * Versioned, namespaced browser storage.
 *
 * Everything the studio knows about a learner lives under a single key so it can
 * be cleared in one step and migrated safely between schema versions.
 */

import type { ProgressState } from './types';

export const STORAGE_KEY = 'financialAccountingMockStudio_v1';
export const SCHEMA_VERSION = 1;

export const emptyProgress = (): ProgressState => ({
  version: SCHEMA_VERSION,
  session: null,
  attempts: {},
  activeExamId: null,
  theme: 'system',
  lastVisited: 'dashboard',
});

/** True when localStorage can be used (private modes and file:// can block it). */
export function storageAvailable(): boolean {
  try {
    const probe = '__fa_mock_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

let memoryFallback: ProgressState | null = null;

function migrate(raw: unknown): ProgressState {
  const base = emptyProgress();
  if (!raw || typeof raw !== 'object') return base;
  const candidate = raw as Partial<ProgressState>;

  // Unknown / missing version: keep only what still validates.
  const version = typeof candidate.version === 'number' ? candidate.version : 0;
  if (version > SCHEMA_VERSION) return base;

  return {
    version: SCHEMA_VERSION,
    session: candidate.session && typeof candidate.session.label === 'string' ? candidate.session : null,
    attempts: candidate.attempts && typeof candidate.attempts === 'object' ? candidate.attempts : {},
    activeExamId: typeof candidate.activeExamId === 'string' ? candidate.activeExamId : null,
    theme:
      candidate.theme === 'light' || candidate.theme === 'dark' || candidate.theme === 'system'
        ? candidate.theme
        : 'system',
    lastVisited: typeof candidate.lastVisited === 'string' ? candidate.lastVisited : 'dashboard',
  };
}

export function loadProgress(): ProgressState {
  if (!storageAvailable()) return memoryFallback ?? emptyProgress();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    return migrate(JSON.parse(raw));
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(state: ProgressState): void {
  if (!storageAvailable()) {
    memoryFallback = state;
    return;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    memoryFallback = state;
  }
}

export function clearProgress(): void {
  memoryFallback = null;
  if (!storageAvailable()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* nothing else we can do locally */
  }
}
