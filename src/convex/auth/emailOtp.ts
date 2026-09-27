/**
 * Six-digit email codes.
 *
 * The code is made here, on the server, and the only thing the browser is told
 * afterwards is that a code was sent. It is never returned, never logged, and
 * never placed in a URL — a code in a query string lands in access logs, browser
 * history and Referer headers, and an emailed code in a subject line shows up
 * on a lock screen.
 *
 * Three details here are security controls rather than style:
 *
 *  - The digits come from `crypto.getRandomValues`. `Math.random()` would make
 *    a code guessable, and OTP guessing is a real attack.
 *  - `maxAge` is how long a stolen code is worth anything. Fifteen minutes is
 *    the ceiling for mail delivery; raising it to be generous widens the
 *    brute-force window directly.
 *  - Every send is rate limited per address, so this endpoint cannot be turned
 *    into a mail-bomb amplifier against an inbox that belongs to somebody else.
 */

import { Email } from '@convex-dev/auth/providers/Email';
import type { EmailConfig } from '@convex-dev/auth/server';
import type { GenericActionCtx, GenericDataModel } from 'convex/server';
import { RandomReader, generateRandomString } from '@oslojs/crypto/random';
import { internal } from '../_generated/api';

/** Fifteen minutes. See the note above: this is a ceiling, not a preference. */
const MAX_AGE_SECONDS = 60 * 15;

/** Uniformly random digits, from the platform CSPRNG. */
async function generateVerificationToken() {
  const random: RandomReader = {
    read(bytes: Uint8Array) {
      crypto.getRandomValues(bytes);
    },
  };
  return generateRandomString(random, '0123456789', 6);
}

/**
 * Send the code, after checking the address is not being hammered.
 *
 * The library calls this with `(params, ctx)` at runtime but only *declares* the
 * first parameter — its own source carries an `@ts-expect-error` on exactly this
 * call for the same reason. The second argument is what makes the rate limit
 * possible, so it is declared here and the cast is the honest way to say so.
 */
async function sendVerificationRequest(
  { identifier, token, expires }: { identifier: string; token: string; expires: Date },
  ctx: GenericActionCtx<GenericDataModel>,
): Promise<void> {
  // Refuse before sending, not after: a rejected send leaves no trace in the
  // recipient's inbox, and cannot be retried into one.
  await ctx.runMutation(internal.otpLimits.rateLimit, { identifier });
  await deliver(identifier, token, expires);
}

export const emailOtp = Email({
  id: 'email-otp',
  maxAge: MAX_AGE_SECONDS,
  generateVerificationToken,
  sendVerificationRequest: sendVerificationRequest as unknown as EmailConfig['sendVerificationRequest'],
});

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}

function minutesUntil(date: Date): number {
  return Math.max(1, Math.round((date.getTime() - Date.now()) / 60000));
}

/**
 * The platform's mail relay.
 *
 * Freebuff provisions this per project, the same way it provisions the Convex
 * deployment: behind it is a real SMTP/mail-API provider that the platform
 * already pays for and runs, and it does the DKIM/SPF work. The upshot is that
 * a fresh deployment can send sign-in mail with no mail account, no domain and
 * no key of its own.
 *
 * The two costs of that convenience are worth stating plainly. Delivery only
 * works on a Freebuff-hosted project — the key is tied to the host — and the
 * sending domain and its reputation belong to the platform, so there is no
 * custom domain to configure and no bounce log to read. A deployment that wants
 * either of those sets `RESEND_API_KEY` and `OTP_FROM` and takes the other
 * branch below instead.
 */
const PLATFORM_RELAY_URL = 'https://auth.freebuff.app/send_otp';

/**
 * The relay's key, read from the deployment's environment.
 *
 * This was a constant in this file, which meant a credential that sends mail
 * through the platform's relay travelled with the source — and this source is
 * published. It is a deployment secret now:
 *
 *   npx convex env set FREEBUFF_EMAIL_KEY <key>
 *
 * Reading it at send time rather than at module load is deliberate. A
 * deployment missing it then fails when somebody asks for a code, with the
 * variable named in the message, instead of failing to evaluate this module
 * and taking the whole function down with it.
 */
function platformRelayKey(): string {
  const key = (process.env.FREEBUFF_EMAIL_KEY ?? '').trim();
  if (!key) {
    throw new Error(
      'FREEBUFF_EMAIL_KEY is not set on this deployment, so sign-in codes cannot be sent. ' +
        'Set it with `npx convex env set FREEBUFF_EMAIL_KEY <key>`.',
    );
  }
  return key;
}

/** Named in the message, so the code arrives with somewhere it obviously belongs. */
const APP_NAME = process.env.VLY_APP_NAME || 'Mock Exam Studio';

/**
 * Deliver the code.
 *
 * Throws on failure, on purpose. If this silently returned, the screen would say
 * a code was sent and the learner would sit waiting for mail that never comes —
 * which is the single most common way an OTP flow fails unnoticed.
 *
 * The relay is the default because it needs no configuration at all. Setting
 * both mail variables switches to the deployment's own sender, which is the only
 * way to choose the from-address and see what bounces.
 */
async function deliver(to: string, code: string, expires: Date): Promise<void> {
  const apiKey = (process.env.RESEND_API_KEY ?? '').trim();
  const from = (process.env.OTP_FROM ?? '').trim();

  if (apiKey && from) {
    await sendViaResend(to, code, expires, apiKey, from);
    return;
  }

  await sendViaPlatformRelay(to, code);
}

/**
 * Hand the code to the platform relay, which renders the message and sends it.
 *
 * Only the code, the address and the app name go over: there is no subject or
 * body to write here, and nothing to keep in step with the platform's template.
 */
async function sendViaPlatformRelay(to: string, code: string): Promise<void> {
  const response = await fetch(PLATFORM_RELAY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': platformRelayKey(),
    },
    body: JSON.stringify({ to, otp: code, appName: APP_NAME }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`The code could not be sent (${response.status}). ${detail.slice(0, 200)}`);
  }
}

/** Deliver from the deployment's own mail account, when one is configured. */
async function sendViaResend(
  to: string,
  code: string,
  expires: Date,
  apiKey: string,
  from: string,
): Promise<void> {
  const minutes = minutesUntil(expires);

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      // The code is in the body only. Subjects are rendered in notification
      // previews, so a code there is a code on a lock screen.
      subject: 'Your Mock Exam Studio sign-in code',
      text: [
        'Your Mock Exam Studio sign-in code:',
        '',
        `    ${code}`,
        '',
        `It expires in ${minutes} minutes.`,
        '',
        'If you did not ask to sign in, you can ignore this message. The code',
        'cannot be used without access to this inbox.',
      ].join('\n'),
      html: `<div style="font-family:system-ui,-apple-system,'Segoe UI',sans-serif;max-width:34rem;color:#17233a">
  <p style="font-size:15px">Your Mock Exam Studio sign-in code:</p>
  <p style="font-size:34px;letter-spacing:10px;font-weight:600;margin:20px 0;padding:14px 0 14px 10px;background:#f4f6f9;border-radius:8px;display:inline-block">${escapeHtml(code)}</p>
  <p style="font-size:14px;color:#46566e">It expires in ${minutes} minutes.</p>
  <p style="font-size:14px;color:#46566e">If you did not ask to sign in, you can ignore this message — the code cannot be used without access to this inbox.</p>
</div>`,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`The code could not be sent (${response.status}). ${detail.slice(0, 200)}`);
  }
}
