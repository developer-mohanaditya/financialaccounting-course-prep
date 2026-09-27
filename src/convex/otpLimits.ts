/**
 * Rate limiting for sign-in codes.
 *
 * Without this, "email me a code" is a way to fill somebody else's inbox: the
 * limiter is the only thing standing between an open form and a mail-bomb
 * amplifier, and an address that is not yours is exactly the one you would not
 * notice being abused.
 *
 * Internal, because it is only ever called from the provider's
 * `sendVerificationRequest`. It refuses *before* anything is sent, so a rejected
 * request leaves no trace in an inbox.
 */

import { internalMutation } from './_generated/server';
import { v } from 'convex/values';

/** One code per minute is enough for anybody who has just pressed the button. */
const COOLDOWN_MS = 60 * 1000;

/** Six an hour still lets a student recover from a mistyped address. */
const HOURLY_LIMIT = 6;

export const rateLimit = internalMutation({
  args: { identifier: v.string() },
  handler: async (ctx, args) => {
    const identifier = args.identifier.trim().toLowerCase();
    const now = Date.now();

    const previous = await ctx.db
      .query('otpSends')
      .withIndex('byIdentifier', (q) => q.eq('identifier', identifier))
      .collect();

    // Older than an hour: no longer a limit, and not worth keeping.
    const recent = previous.filter((row) => now - row.sentAt < 60 * 60 * 1000);
    const stale = previous.filter((row) => now - row.sentAt >= 60 * 60 * 1000);
    for (const row of stale) await ctx.db.delete(row._id);

    const lastSent = recent.reduce((max, row) => Math.max(max, row.sentAt), 0);
    if (now - lastSent < COOLDOWN_MS) {
      throw new Error('A code was sent to this address moments ago. Wait a minute before asking for another.');
    }
    if (recent.length >= HOURLY_LIMIT) {
      throw new Error('Too many codes have been asked for this address. Try again in an hour.');
    }

    await ctx.db.insert('otpSends', { identifier, sentAt: now });
    return { ok: true };
  },
});
