/**
 * Answer normalisation helpers.
 *
 * Monetary answers arrive as free text typed by the learner, so the engine has
 * to accept the formats the paper itself uses: "1 200", "1,200", "-0.50",
 * "1.234,56" (French style) or "1,234.56".
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

/** Quantity/amount comparison with an explicit tolerance (default: exact to the cent). */
export function amountsEqual(
  input: string | number | null | undefined,
  expected: number | null,
  tolerance = 0.005,
): boolean {
  const given = parseAmount(input);
  if (given === null || expected === null) return given === expected;
  return Math.abs(given - expected) <= tolerance;
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

const ACCOUNT_STOP_WORDS = new Set(['the', 'of', 'and', 'to', 'be', 'a', 'an']);

function accountTokens(input: string): Set<string> {
  return new Set(
    normaliseText(input)
      .split(' ')
      .filter((token) => token && !ACCOUNT_STOP_WORDS.has(token)),
  );
}

/**
 * Compare two chart-of-accounts wordings.
 *
 * Accepts an exact match, a leading-account-name match, or an equivalent wording
 * built only from the terms of the expected answer (so "Invoices to be received"
 * scores against "Trade payables - Invoices to be received").
 */
export function accountWordingMatches(input: string, expected: string): boolean {
  const given = normaliseText(input);
  const target = normaliseText(expected);
  if (!given) return false;
  if (given === target) return true;

  const givenTokens = accountTokens(input);
  const targetTokens = accountTokens(expected);
  if (givenTokens.size === 0) return false;

  for (const token of givenTokens) {
    if (!targetTokens.has(token)) return false;
  }
  return true;
}

/** Account number comparison that tolerates a trailing zero (e.g. 40 vs 401). */
export function accountNumberMatches(input: string, expected: string): boolean {
  const given = (input ?? '').trim().replace(/[^0-9]/g, '');
  const target = (expected ?? '').trim().replace(/[^0-9]/g, '');
  if (!given || !target) return false;
  return given === target;
}

const MONTHS: Record<string, number> = {
  jan: 1, january: 1,
  feb: 2, february: 2,
  mar: 3, march: 3,
  apr: 4, april: 4,
  may: 5,
  jun: 6, june: 6,
  jul: 7, july: 7,
  aug: 8, august: 8,
  sep: 9, sept: 9, september: 9,
  oct: 10, october: 10,
  nov: 11, november: 11,
  dec: 12, december: 12,
};

function expandYear(raw: string): number {
  const n = Number(raw);
  if (raw.length <= 2) return 2000 + n;
  return n;
}

/**
 * Parse a date typed in any of the layouts used on the paper:
 * 17/09/26, 17-09-2026, 17.09.2026, 2026-09-17, 17 Sept 2026, September 17, 2026.
 */
export function parseDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const text = input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\./g, '/')
    .replace(/,/g, ' ')
    .replace(/[-](?=\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$)/g, '/')
    .replace(/\s+/g, ' ');
  if (!text) return null;

  const iso = /^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/.exec(text);
  if (iso) return buildIso(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const numeric = /^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/.exec(text);
  if (numeric) {
    return buildIso(expandYear(numeric[3]), Number(numeric[2]), Number(numeric[1]));
  }

  const dmy = /^(\d{1,2})\s+([a-zA-Z]+)\s+(\d{2,4})$/.exec(text);
  if (dmy && MONTHS[dmy[2].toLowerCase()]) {
    return buildIso(expandYear(dmy[3]), MONTHS[dmy[2].toLowerCase()], Number(dmy[1]));
  }

  const mdy = /^([a-zA-Z]+)\s+(\d{1,2})\s+(\d{2,4})$/.exec(text);
  if (mdy && MONTHS[mdy[1].toLowerCase()]) {
    return buildIso(expandYear(mdy[3]), MONTHS[mdy[1].toLowerCase()], Number(mdy[2]));
  }

  return null;
}

function buildIso(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function datesMatch(input: string, expected: string): boolean {
  const a = parseDate(input);
  const b = parseDate(expected);
  return a !== null && b !== null && a === b;
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

/** "1 234.50" style amount used across the studio. */
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
