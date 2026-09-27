/**
 * The session as the interface sees it.
 *
 * A guest session is a label and nothing more. An email session is a label too —
 * the credential that actually proves anything is a Convex Auth session, stored
 * and refreshed by the library under its own key, and there is deliberately no
 * second copy of it here to drift out of step.
 *
 * What is left in this module is the small display record that rides along with
 * the study progress, so the sidebar and Settings have something to show.
 */

import type { SessionRecord } from './types';

export function guestSession(): SessionRecord {
  return { kind: 'guest', label: 'Guest', startedAt: new Date().toISOString() };
}

export function emailSession(label: string, startedAt?: string): SessionRecord {
  return {
    kind: 'email',
    label,
    startedAt: startedAt ?? new Date().toISOString(),
  };
}
