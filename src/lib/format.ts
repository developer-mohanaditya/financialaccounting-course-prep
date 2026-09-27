/**
 * Display formatting and text normalisation.
 *
 * Everything here is safe in the browser: it formats values for reading and
 * normalises text for the chart-of-accounts search box. It never compares a
 * submitted answer against a key — those rules live in `matching.ts`, which is
 * imported only by the server-side marking engine.
 */

/** Parse a typed amount. Returns null when the text cannot be read as a number. */
export function parseAmount(input: string | number | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return Number.isFinite(input) ? input : null;

  let text = input.trim();
  if (!text) return null;

  text = text.replace(/[\u00a0\u202f\s]/g, '');
  text = text.replace(/[€$£]/g, '');
  const negative = /^\(.*\)$/.test(text) || text.startsWith('-');
  text = text.replace(/[()]/g, '').replace(/^[+-]/, '');

  const lastComma = text.lastIndexOf(',');
  const lastDot = text.lastIndexOf('.');

  if (lastComma > -1 && lastDot > -1) {
    // Both separators present: the rightmost one is the decimal separator.
    if (lastComma > lastDot) text = text.replace(/\./g, '').replace(',', '.');
    else text = text.replace(/,/g, '');
  } else if (lastComma > -1) {
    const decimals = text.length - lastComma - 1;
    // "1,200" and "1,20" are thousands groups; "1,5" is a decimal comma.
    if (decimals === 3) text = text.replace(/,/g, '');
    else text = text.replace(/,/g, '.');
  }

  const value = Number(text);
  if (!Number.isFinite(value)) return null;
  return negative ? -Math.abs(value) : value;
}

/** Lower-case, accent-free, punctuation-free, single-spaced text. */
export function normaliseText(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** Human label for an ISO date, e.g. "17 Sept 2026". */
export function formatIsoDate(iso: string | null): string {
  if (!iso) return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const month = Number(match[2]);
  const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${Number(match[3])} ${names[month - 1]} ${match[1]}`;
}

/** "1 234,50" style amount used across the studio. */
export function formatAmount(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return '';
  const negative = value < 0;
  const fixed = Math.abs(value).toFixed(decimals);
  const [whole, frac] = fixed.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const body = decimals > 0 ? `${grouped},${frac}` : grouped;
  return negative ? `(${body})` : body;
}

export function formatPoints(value: number): string {
  return value.toFixed(2);
}

export function formatLocalDateTime(iso: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return '—';
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}
