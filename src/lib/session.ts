/**
 * Frontend-only session gate.
 *
 * No server is contacted and nothing leaves the browser: the six-digit code is
 * generated locally, kept in memory for the current verification step, and the
 * only thing persisted is a non-sensitive session label.
 */

export interface PendingVerification {
  email: string;
  code: string;
  issuedAt: number;
}

const CODE_TTL_MS = 10 * 60 * 1000;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 190) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function normaliseEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function generateCode(): string {
  const array = new Uint32Array(1);
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    crypto.getRandomValues(array);
    return String(array[0] % 1_000_000).padStart(6, '0');
  }
  return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
}

export function createPendingVerification(email: string): PendingVerification {
  return { email: normaliseEmail(email), code: generateCode(), issuedAt: Date.now() };
}

export function isExpired(pending: PendingVerification | null): boolean {
  if (!pending) return true;
  return Date.now() - pending.issuedAt > CODE_TTL_MS;
}

export function codeMatches(pending: PendingVerification | null, input: string): boolean {
  if (!pending) return false;
  return input.replace(/\D/g, '') === pending.code;
}
