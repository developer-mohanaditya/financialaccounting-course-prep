import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

/**
 * Identities and sessions are owned by Convex Auth — see `auth.ts`. Its tables
 * carry the five user fields the library maintains, and the `email` index it
 * needs to link a sign-in to an existing user; neither may be dropped.
 *
 * This database holds no product data about the papers. The answer keys are not
 * here at all: they live inside the function bundle in `exams.ts`, which a
 * browser cannot read. The only product row is the study record below.
 */
export default defineSchema({
  ...authTables,

  /**
   * The study record, one per user, so progress follows a learner between
   * devices. Held as the JSON the browser would have kept in localStorage; it is
   * validated by the same migration on the way in and on the way out.
   */
  studyProgress: defineTable({
    userId: v.id('users'),
    /** Serialised ProgressState. */
    state: v.string(),
    updatedAt: v.number(),
    /** Bumped on every write, so a second device can tell it is behind. */
    rev: v.number(),
  }).index('byUser', ['userId']),

  /**
   * A guard against using the sign-in form to mail somebody else's inbox.
   *
   * A six-digit code is only as good as the rate limit around it: without one,
   * "email me a code" is an amplifier for spamming an address that belongs to
   * someone else. One row per address, counting recent sends.
   */
  otpSends: defineTable({
    identifier: v.string(),
    sentAt: v.number(),
  }).index('byIdentifier', ['identifier']),
});
