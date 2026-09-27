/**
 * Signing in, wrapped once.
 *
 * Pages ask this hook what they need and never touch the auth library directly,
 * so the provider id, the loading rules and the error wording all live in one
 * place. The two-step flow is a single `signIn` call per step — the library
 * routes on which fields are present — and the code is passed as a parameter
 * and never stored, logged, or echoed back in a message.
 */

import { useCallback, useState } from 'react';
import { useAuthActions, useConvexAuth } from '@convex-dev/auth/react';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';

const PROVIDER = 'email-otp';

function readError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length < 6 || trimmed.length > 190) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export interface SignIn {
  /** Step one: ask for a code. Resolves once the mail is on its way. */
  requestCode: (email: string) => Promise<void>;
  sending: boolean;
  /** Step two: hand the code back. Resolves once the server has accepted it. */
  verifyCode: (email: string, code: string) => Promise<void>;
  verifying: boolean;
  error: string | null;
  clearError: () => void;
  signOut: () => Promise<void>;
}

export function useAuth(): {
  isLoading: boolean;
  isAuthenticated: boolean;
  email: string | null;
  actions: SignIn;
} {
  const { isLoading: authLoading, isAuthenticated } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();
  const me = useQuery(api.study.me, isAuthenticated ? undefined : 'skip');

  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = useCallback(
    async (email: string) => {
      if (!isValidEmail(email)) {
        setError('Enter a complete email address, for example name@school.edu.');
        throw new Error('invalid email');
      }
      setSending(true);
      setError(null);
      try {
        await signIn(PROVIDER, { email: email.trim().toLowerCase() });
      } catch (cause) {
        // Includes the rate limiter and a failed send. Both are worth showing:
        // a silent failure here means waiting for mail that never arrives.
        setError(readError(cause, 'The code could not be sent. Try again in a moment.'));
        throw cause;
      } finally {
        setSending(false);
      }
    },
    [signIn],
  );

  const verifyCode = useCallback(
    async (email: string, code: string) => {
      setVerifying(true);
      setError(null);
      try {
        // The library routes on which fields are present: an address asks for a
        // code, an address plus a code redeems it. It answers
        // `{ signingIn, redirect }`; whether the session is live is read from
        // `isAuthenticated` rather than guessed from this return value.
        await signIn(PROVIDER, {
          email: email.trim().toLowerCase(),
          code: code.replace(/\D/g, '').slice(0, 6),
        });
      } catch (cause) {
        setError(readError(cause, 'That code could not be checked. Try again.'));
        throw cause;
      } finally {
        setVerifying(false);
      }
    },
    [signIn],
  );

  const end = useCallback(async () => {
    setError(null);
    try {
      await signOut();
    } catch {
      // The local token is cleared either way; the session expires on its own.
    }
  }, [signOut]);

  return {
    // A signed-in check that has not answered yet is still loading. Reporting
    // "not signed in" here would flash the start screen on every refresh.
    isLoading: authLoading || (isAuthenticated && me === undefined),
    isAuthenticated,
    email: me?.email ?? null,
    actions: {
      requestCode,
      sending,
      verifyCode,
      verifying,
      error,
      clearError: () => setError(null),
      signOut: end,
    },
  };
}
