/**
 * Answer-matching rules — SERVER SIDE ONLY.
 *
 * These predicates decide whether a submitted answer agrees with the key. They
 * describe the *marking scheme itself*, so they must never be bundled into the
 * browser: a client that ships them lets a student probe the rules by trial.
 *
 * `normaliseText` and `parseAmount` stay in `format.ts` because the study
 * interface needs them for display and for the chart-of-accounts search box.
 * Without a key alongside them, neither reveals anything.
 */

import { normaliseText, parseAmount } from './format';

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

function buildIso(year: number, month: number, day: number): string | null {
  if (!year || !month || !day) return null;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
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

export function datesMatch(input: string, expected: string): boolean {
  const a = parseDate(input);
  const b = parseDate(expected);
  return a !== null && b !== null && a === b;
}
