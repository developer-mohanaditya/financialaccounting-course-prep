/**
 * The study record.
 *
 * Identity is not decided here — Convex Auth owns it, and this file simply asks
 * who the caller is via `ctx.auth.getUserIdentity()`. That is the point of using
 * the library: there is no hand-rolled token, no hand-rolled session table and
 * no hand-rolled hashing to get wrong.
 *
 * Note what these functions do *not* do: they do not read the papers. Marking
 * lives in `exams.ts` and needs no account at all, so a guest can still hand in
 * a paper and be marked.
 */

import { mutation, query } from './_generated/server';
import type { MutationCtx, QueryCtx } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';
import { v } from 'convex/values';

/** Prefixed so the browser can tell a conflict from a dropped connection. */
export const CONFLICT_PREFIX = 'CONFLICT:';

export interface SavedProgress {
  state: string | null;
  rev: number;
  updatedAt: number | null;
}

/**
 * Who is signed in, for the interface. Null when nobody is.
 *
 * The address is read from the account row, not from the token. A self-issued
 * token carries the session's subject and nothing else, so asking the identity
 * for an email answers `null` for every caller, and the signed-in interface
 * could never name the learner it is showing.
 */
export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const user = await ctx.db.get(userId);
    return { userId, email: user?.email ?? null };
  },
});

/**
 * Read this user's saved progress.
 *
 * The state comes back as the JSON the browser stored rather than as a parsed
 * object, so the browser migrates it with exactly the same code that guards its
 * local copy. A shape this function has never seen cannot crash the studio.
 */
export const loadProgress = query({
  args: {},
  handler: async (ctx): Promise<SavedProgress> => {
    const userId = await requireUser(ctx);
    const saved = await ctx.db
      .query('studyProgress')
      .withIndex('byUser', (q) => q.eq('userId', userId))
      .unique();

    if (!saved) return { state: null, rev: 0, updatedAt: null };
    return { state: saved.state, rev: saved.rev, updatedAt: saved.updatedAt };
  },
});

/**
 * Write this user's progress.
 *
 * `baseRev` is the revision the caller believed it was editing. A write arriving
 * with a stale revision is refused rather than merged, so a phone that was asleep
 * for a week cannot quietly overwrite an afternoon's work on a laptop with an
 * empty sheet. The browser resolves that by pulling, merging, and trying again.
 */
export const saveProgress = mutation({
  args: { state: v.string(), baseRev: v.number() },
  handler: async (ctx, args): Promise<{ rev: number; updatedAt: number }> => {
    const userId = await requireUser(ctx);
    const now = Date.now();

    const existing = await ctx.db
      .query('studyProgress')
      .withIndex('byUser', (q) => q.eq('userId', userId))
      .unique();

    if (!existing) {
      await ctx.db.insert('studyProgress', {
        userId,
        state: args.state,
        updatedAt: now,
        rev: 1,
      });
      return { rev: 1, updatedAt: now };
    }

    if (args.baseRev !== existing.rev) {
      throw new Error(`${CONFLICT_PREFIX} this account has newer progress saved from another device.`);
    }

    const rev = existing.rev + 1;
    await ctx.db.patch(existing._id, { state: args.state, updatedAt: now, rev });
    return { rev, updatedAt: now };
  },
});

/**
 * The signed-in learner's account id, or a refusal. Every one of these is
 * account-only; a guest has nothing on the server.
 *
 * The id comes from the library's helper rather than from `identity.subject`:
 * the subject is `<userId>|<sessionId>`, and these rows are keyed by the
 * *account*. Keying on the subject would give every sign-in its own progress
 * row, so a learner would look like a different person the next time they
 * signed in, and two devices at once would have nothing in common to merge.
 */
async function requireUser(ctx: QueryCtx | MutationCtx): Promise<Id<'users'>> {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    throw new Error('Sign in with your email address to keep progress between devices.');
  }
  return userId;
}
