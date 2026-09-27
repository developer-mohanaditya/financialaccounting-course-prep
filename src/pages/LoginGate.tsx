import { useEffect, useRef, useState } from 'react';
import { useStudio } from '../state/StudioContext';
import { isValidEmail } from '../lib/useAuth';
import { IconArrow, IconCheck, IconShield } from '../components/Icons';

type Step = 'entry' | 'sent' | 'verify';

/**
 * Matches the server's limit, so the button explains itself rather than
 * pressing and producing an error. The server still enforces it — this is
 * courtesy, not the control.
 */
const RESEND_COOLDOWN_SECONDS = 60;

const POINTS = [
  'Ten complete mock exams in the exam-paper format used in the course.',
  'Multiple-choice questions marked +0.50 / −0.25 / 0, exactly as on the paper.',
  'Case questions answered in date, account and amount tables, marked per correct line.',
  'Solutions unlock once an exam has been graded, with the full correct tables.',
  'Sign in with your address and your work follows you between laptop and phone.',
];

export function LoginGate() {
  const { continueAsGuest, adoptAccount, auth } = useStudio();
  const [step, setStep] = useState<Step>('entry');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const handle = window.setTimeout(() => setCooldown((n) => n - 1), 1000);
    return () => window.clearTimeout(handle);
  }, [cooldown]);

  // Once the server has confirmed a session, carry any local work up and go.
  useEffect(() => {
    if (auth.isAuthenticated) void adoptAccount();
  }, [auth.isAuthenticated, adoptAccount]);

  useEffect(() => {
    if (step === 'verify') codeRef.current?.focus();
  }, [step]);

  const requestCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a complete email address, for example name@school.edu.');
      return;
    }
    setError(null);
    try {
      await auth.actions.requestCode(email);
      setSentTo(email.trim().toLowerCase());
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setStep('sent');
    } catch {
      // The hook has already put a readable message in auth.actions.error.
    }
  };

  const verify = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6 || !sentTo) return;
    setError(null);
    try {
      await auth.actions.verifyCode(sentTo, code);
      // No navigation here: adoptAccount() reacts to the confirmed session.
    } catch {
      setCode('');
    }
  };

  const startOver = () => {
    setSentTo(null);
    setCode('');
    setError(null);
    auth.actions.clearError();
    setStep('entry');
  };

  const message = error ?? auth.actions.error;

  return (
    <div className="gate">
      <section className="gate-intro">
        <div>
          <p className="eyebrow">Financial Accounting</p>
          <h1>Mock Exam Studio</h1>
          <p className="lede" style={{ marginTop: 14 }}>
            A focused workspace for rehearsing the financial accounting paper: ten mock exams built on the course
            slides, the case handouts and the examination format used in the programme.
          </p>
        </div>

        <ul className="gate-points">
          {POINTS.map((point) => (
            <li key={point}>
              <span className="tick"><IconCheck size={15} /></span>
              <span>{point}</span>
            </li>
          ))}
        </ul>

        <p className="tiny" style={{ color: '#8fa4c4', margin: 0 }}>
          Papers are marked on a server that never holds your answers. A guest session keeps everything in this
          browser instead.
        </p>
      </section>

      <section className="gate-panel">
        {step === 'entry' ? (
          <>
            <div>
              <h2>Begin a study session</h2>
              <p className="muted small" style={{ marginTop: 6 }}>
                Sign in with your address to keep your work on every device, or continue as a guest and keep it
                here.
              </p>
            </div>

            <form className="stack gap-sm" onSubmit={requestCode}>
              <div className="field">
                <label className="field-label" htmlFor="gate-email">
                  Email address
                </label>
                <input
                  id="gate-email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@school.edu"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setError(null);
                    auth.actions.clearError();
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={auth.actions.sending}>
                {auth.actions.sending ? 'Sending…' : 'Email me a code'} <IconArrow />
              </button>
            </form>

            {message && (
              <div className="callout callout-danger" role="alert">
                {message}
              </div>
            )}

            <div className="gate-divider">or</div>

            <button type="button" className="btn btn-outline btn-block" onClick={continueAsGuest}>
              Continue as guest
            </button>

            <p className="tiny muted" style={{ margin: 0 }}>
              No password. A six-digit code is sent to your inbox and expires after fifteen minutes.
            </p>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">Verification</p>
              <h2>{step === 'sent' ? 'Check your email' : 'Enter your six-digit code'}</h2>
              <p className="muted small" style={{ marginTop: 6 }}>
                {step === 'sent' ? (
                  <>
                    A code is on its way to <strong>{sentTo}</strong>. It expires in fifteen minutes.
                  </>
                ) : (
                  <>
                    Enter the six digits sent to <strong>{sentTo}</strong>.
                  </>
                )}
              </p>
            </div>

            {step === 'sent' ? (
              <>
                <div className="dev-code">
                  <span className="row gap-xs">
                    <IconShield size={13} />
                    Waiting on {sentTo}
                  </span>
                </div>
                <div className="row gap-sm wrap">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setCode('');
                      setError(null);
                      auth.actions.clearError();
                      setStep('verify');
                    }}
                  >
                    I have the code
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
                    Use a different address
                  </button>
                </div>
              </>
            ) : (
              <>
                <form className="stack gap-sm" onSubmit={verify}>
                  <div className="field">
                    <label className="field-label sr-only" htmlFor="gate-code">
                      Six-digit code
                    </label>
                    <input
                      id="gate-code"
                      ref={codeRef}
                      className="otp-input"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      placeholder="000000"
                      value={code}
                      onChange={(event) => {
                        setCode(event.target.value.replace(/\D/g, '').slice(0, 6));
                        setError(null);
                        auth.actions.clearError();
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-block"
                    disabled={code.length !== 6 || auth.actions.verifying}
                  >
                    {auth.actions.verifying ? 'Checking…' : 'Verify and continue'}
                  </button>
                </form>

                {message && (
                  <div className="callout callout-danger" role="alert">
                    {message}
                  </div>
                )}

                <div className="row gap-sm wrap">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={requestCode}
                    disabled={auth.actions.sending || cooldown > 0}
                  >
                    {cooldown > 0 ? `Send another code (${cooldown}s)` : 'Send another code'}
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
                    Use a different address
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
