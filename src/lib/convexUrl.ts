/**
 * The backend's address, as *this browser* has to reach it.
 *
 * `VITE_CONVEX_URL` is fixed at build time and `convex dev` writes it as
 * `http://127.0.0.1:3210` — the backend's address inside the machine running
 * it. That is the right address only when the browser is on that same machine.
 * A hosted preview means the browser is somewhere else, where `127.0.0.1` is
 * the *viewer's* own computer: nothing is listening there, every query,
 * `signIn` and `gradeAttempt` fails, and the failure looks like an application
 * bug rather than an address that never could have worked.
 *
 * Freebuff publishes every listening port on its own host, `<port>-<host>`, so
 * the backend sits at the page's own host suffix with the backend's port in
 * front of it. When the page is not itself loopback, that is the address to
 * use. A build handed a genuinely public address is returned exactly as it was
 * configured.
 */

/** Hosts that mean "this machine", and so can only serve a local browser. */
const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '0.0.0.0']);

/** The Convex dev server's client port. */
const CONVEX_PORT = '3210';

/**
 * The backend a deployed build talks to: this project's production deployment.
 *
 * It is here, rather than only in the build's environment, because a *deployed*
 * build cannot read that environment: Freebuff's hosting stores production
 * variables sealed, so a `VITE_` value arrives in the bundle as an envelope
 * (`{"v":"v2","c":…,"k":…}`) instead of the address that was set. A value that
 * is not an address is not an address, and falling back to the deployment this
 * app is built against is the difference between a working site and a blank
 * one. The preview never takes this path — `convex dev` gives it a loopback
 * address, which the rewrite below turns into the platform's public port host.
 *
 * It is also the answer for a loopback address on a page served from somewhere
 * else entirely — a deployed build handed the sandbox's own `convex dev`
 * address, which no browser outside this machine could ever reach.
 *
 * Change this when the app moves to a different deployment.
 */
export const DEPLOYED_BACKEND_URL = 'https://adorable-civet-599.convex.cloud';

function isLoopback(hostname: string): boolean {
  const host = hostname.trim().toLowerCase();
  return LOOPBACK_HOSTS.has(host) || host.startsWith('127.');
}

/** The configured value as a usable address, or null when it is not one. */
function asHttpUrl(configured: string): URL | null {
  try {
    const url = new URL(configured.trim());
    return url.protocol === 'http:' || url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

export function resolveConvexUrl(configured: string, pageHostname: string): string {
  const url = asHttpUrl(configured);
  if (url === null) return DEPLOYED_BACKEND_URL;

  if (!isLoopback(url.hostname)) return configured;

  const page = pageHostname.trim().toLowerCase().replace(/:\d+$/, '');
  // Served from this machine — a `file://` portable build included — or from
  // loopback: the configured address is the right one.
  if (page === '' || isLoopback(page)) return configured;

  // `<port>-<host>`: strip the page's own port prefix to get the host suffix.
  const suffix = page.replace(/^\d+-/, '');
  if (suffix === page) return DEPLOYED_BACKEND_URL;

  url.protocol = 'https:';
  url.hostname = `${url.port || CONVEX_PORT}-${suffix}`;
  url.port = '';
  return url.toString().replace(/\/$/, '');
}
