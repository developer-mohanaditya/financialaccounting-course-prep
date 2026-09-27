/**
 * Convex Auth wiring.
 *
 * One provider: a six-digit code sent to an email address. There is no password,
 * no password reset and no third-party identity provider, so there is nothing
 * to forget and nothing to leak.
 *
 * There is deliberately no `Anonymous` provider. A guest session in this studio
 * is *local only* — no identity, no server row, nothing synced — so giving it a
 * server-side identity would be misleading, and would create accounts for people
 * who never asked for one. Guest work stays in the browser until somebody
 * chooses to sign in and carry it up.
 *
 * Note also that an account here means "this inbox received a code", which is
 * the only claim being made. Nothing sensitive is gated on a session existing;
 * the marking endpoint is open to anyone, because a paper can be sat without an
 * account and must be gradeable.
 *
 * Do not "tidy" this file. See `auth.config.ts` for the customJwt trap, and
 * `http.ts` for the OIDC routes whose absence fails silently.
 */

import { convexAuth } from '@convex-dev/auth/server';
import { emailOtp } from './auth/emailOtp';

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp],
});
