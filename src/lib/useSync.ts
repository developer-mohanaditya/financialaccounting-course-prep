/**
 * Keeping the account in step with this browser.
 *
 * The order is always local first: every answer is written to this browser and
 * rendered immediately, and the push to the account happens afterwards. A paper
 * can therefore be sat start to finish with no connection — and for a guest,
 * which is who most of this class will be, nothing is ever sent anywhere.
 *
 * Conflicts are resolved by pulling and merging rather than by asking. The merge
 * keeps whichever attempt for each paper is further along, so a graded result
 * is never the thing that gets overwritten, which is the only outcome that
 * would actually lose work.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { mergeProgress } from './merge';
import { parseProgress } from './storage';
import type { ProgressState } from './types';

/** Long enough that typing an entry is not a write, short enough to feel current. */
const PUSH_DEBOUNCE_MS = 2500;

export type SyncState = 'idle' | 'syncing' | 'synced' | 'offline' | 'conflict';

export interface Sync {
  state: SyncState;
  lastSyncedAt: number | null;
  /** Papers that arrived from another device, for a one-line note in Settings. */
  mergedPapers: string[];
  clearMergedPapers: () => void;
}

interface Options {
  /** The current local record, or null before it has been read. */
  state: ProgressState | null;
  /** Whether there is a signed-in account to sync with. */
  enabled: boolean;
  /** Called when the account holds work this browser does not. */
  applyRemote: (merged: ProgressState) => void;
}

export function useSync({ state, enabled, applyRemote }: Options): Sync {
  const save = useMutation(api.study.saveProgress);
  const remote = useQuery(api.study.loadProgress, enabled ? undefined : 'skip');

  const [syncState, setSyncState] = useState<SyncState>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [mergedPapers, setMergedPapers] = useState<string[]>([]);

  /** The revision this browser believes the account is at. */
  const rev = useRef(0);
  /** The last payload the account accepted, so the same record is not sent twice. */
  const pushed = useRef<string | null>(null);
  const timer = useRef<number | null>(null);
  const inFlight = useRef(false);

  // A different account means a different revision to build on.
  useEffect(() => {
    rev.current = 0;
    pushed.current = null;
    setSyncState('idle');
    setLastSyncedAt(null);
    setMergedPapers([]);
  }, [enabled]);

  /**
   * Fold the account's copy into what is here, and hand the result back.
   *
   * Returns the merged record so a caller can push it straight on rather than
   * waiting for the next render to notice.
   */
  const absorb = useCallback(
    (local: ProgressState): ProgressState => {
      const parsed = remote?.state ? parseProgress(remote.state) : null;
      if (!parsed) return local;
      const outcome = mergeProgress(local, parsed);
      if (outcome.changed) {
        applyRemote(outcome.state);
        setMergedPapers(outcome.adopted);
        return outcome.state;
      }
      return local;
    },
    [remote?.state, applyRemote],
  );

  const push = useCallback(
    async (next: ProgressState, baseRev: number, isRetry = false) => {
      if (!enabled) return;
      const serialised = JSON.stringify(next);
      if (!isRetry && (serialised === pushed.current || inFlight.current)) return;

      inFlight.current = true;
      setSyncState('syncing');
      try {
        const result = await save({ state: serialised, baseRev });
        rev.current = result.rev;
        pushed.current = serialised;
        setLastSyncedAt(result.updatedAt);
        setSyncState('synced');
      } catch (error) {
        const message = error instanceof Error ? error.message : '';

        if (message.startsWith('CONFLICT:') && !isRetry) {
          // Another device wrote first. Take its copy, keep whatever is further
          // along, and send the combined record once.
          inFlight.current = false;
          setSyncState('conflict');
          const merged = absorb(next);
          await push(merged, remote?.rev ?? 0, true);
          return;
        }

        // No connection, or the session has ended. Nothing is lost: the record
        // is already in this browser and the next change will try again.
        setSyncState('offline');
      } finally {
        inFlight.current = false;
      }
    },
    [enabled, save, absorb, remote?.rev],
  );

  // Push once the dust settles.
  useEffect(() => {
    if (!enabled || !state) return;
    if (JSON.stringify(state) === pushed.current) return;

    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      void push(state, rev.current);
    }, PUSH_DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [state, enabled, push]);

  // The account's own copy arriving is the first thing to reconcile against.
  useEffect(() => {
    if (!enabled || !state || !remote) return;
    if (remote.state === null) {
      // Nothing saved yet: whatever is here becomes the account's first copy.
      rev.current = 0;
      pushed.current = null;
      return;
    }
    if (pushed.current === null) rev.current = remote.rev;
    absorb(state);
    // Deliberately not depending on `state`: re-running on every render after a
    // merge would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote, enabled]);

  return {
    state: syncState,
    lastSyncedAt,
    mergedPapers,
    clearMergedPapers: () => setMergedPapers([]),
  };
}
