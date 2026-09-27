/**
 * Author access.
 *
 * The content console reads full papers, so it is gated twice. The gate in this
 * module decides whether the console is *built at all*: both credentials come
 * from build-time environment variables and there is no fallback, so a build
 * made without them simply has no way in. The gate on the server then decides
 * whether a request is *allowed*, by comparing the key against
 * AUTHOR_ACCESS_KEY in the deployment's environment.
 *
 * Splitting it this way means a leak can be closed without a redeploy: rotate
 * AUTHOR_ACCESS_KEY and every deployed build stops working at once, because the
 * server is the one that decides.
 *
 * What this is not: a way to keep a secret from someone who reads the bundle. A
 * static client cannot do that. The protection is that the console has to be
 * enabled deliberately, is reachable by URL only, is named nowhere in the study
 * interface, and can be switched off centrally.
 *
 * Enter it by URL: `/admin`, or `#/admin` (which also works for the single-file
 * build opened straight from disk).
 */

import { useEffect, useState } from 'react';

const env = import.meta.env as Record<string, string | undefined>;

/** Both values are absent in a build made without them; the console stays shut. */
const AUTHOR_EMAIL = (env.VITE_AUTHOR_EMAIL ?? '').trim().toLowerCase();
const ACCESS_KEY = (env.VITE_AUTHOR_ACCESS_KEY ?? '').trim();

/**
 * True when this build was given the credentials to open the console. Checked
 * before anything is rendered, so a build without them carries no console code
 * path a reader could follow.
 */
export const authorConsoleEnabled = AUTHOR_EMAIL !== '' && ACCESS_KEY !== '';

/**
 * Kept outside the study-progress key on purpose: clearing study progress must
 * never sign the author out, and the record stays untouched by schema migrations.
 */
export const AUTHOR_STORAGE_KEY = 'financialAccountingMockStudio_author_v1';

export interface AuthorSession {
  email: string;
  since: string;
}

/** Do these credentials belong to the author account? */
export function areAuthorCredentials(email: string, key: string): boolean {
  if (!authorConsoleEnabled) return false;
  const givenEmail = email.trim().toLowerCase();
  const givenKey = key.trim();
  return givenEmail === AUTHOR_EMAIL && givenKey === ACCESS_KEY;
}

/** The key the console presents to the server, for the content queries. */
export function authorAccessKey(): string {
  return ACCESS_KEY;
}

export function readAuthorSession(): AuthorSession | null {
  if (!authorConsoleEnabled) return null;
  try {
    const raw = window.localStorage.getItem(AUTHOR_STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as Partial<AuthorSession>;
    if (stored?.email !== AUTHOR_EMAIL || typeof stored.since !== 'string') return null;
    return { email: AUTHOR_EMAIL, since: stored.since };
  } catch {
    return null;
  }
}

export function writeAuthorSession(): AuthorSession {
  const session: AuthorSession = { email: AUTHOR_EMAIL, since: new Date().toISOString() };
  try {
    window.localStorage.setItem(AUTHOR_STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage blocked: the session then only lasts for this page */
  }
  return session;
}

export function clearAuthorSession(): void {
  try {
    window.localStorage.removeItem(AUTHOR_STORAGE_KEY);
  } catch {
    /* storage blocked: nothing else we can do locally */
  }
}

/** True when the address bar points at the console. */
function authorRouteActive(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = window.location.hash.replace(/^#\/?/, '').replace(/\/+$/, '').toLowerCase();
  const path = window.location.pathname.replace(/\/+$/, '').toLowerCase();
  return hash === 'admin' || path.endsWith('/admin');
}

/** Subscribe to the console route, so entering or leaving it re-renders. */
export function useAuthorRoute(): boolean {
  const [active, setActive] = useState(authorRouteActive);

  useEffect(() => {
    const update = () => setActive(authorRouteActive());
    window.addEventListener('hashchange', update);
    window.addEventListener('popstate', update);
    update();
    return () => {
      window.removeEventListener('hashchange', update);
      window.removeEventListener('popstate', update);
    };
  }, []);

  return active;
}

/**
 * Rewrite the address bar and tell the listeners about it. Some contexts (a page
 * opened straight from disk, for instance) refuse history rewrites, so a failure
 * falls back to the fragment and can never leave the studio in a broken state.
 */
function replaceUrl(next: string): void {
  try {
    window.history.replaceState(null, '', next);
  } catch {
    const fragment = next.includes('#') ? next.slice(next.indexOf('#')) : '';
    window.location.hash = fragment;
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}

/** Send the browser to the console without a full page load. */
export function enterAuthorRoute(): void {
  const { pathname, search } = window.location;
  replaceUrl(`${pathname}${search}#/admin`);
}

/** Return to the study workspace, dropping the console fragment. */
export function leaveAuthorRoute(): void {
  const { pathname, search, hash } = window.location;
  const withoutTrailing = pathname.replace(/\/+$/, '').toLowerCase();

  if (withoutTrailing.endsWith('/admin')) {
    replaceUrl(`${pathname.replace(/\/admin\/?$/i, '/')}${search}`);
    return;
  }
  if (/^#\/?admin/i.test(hash)) {
    replaceUrl(`${pathname}${search}`);
    return;
  }
  window.dispatchEvent(new PopStateEvent('popstate'));
}
