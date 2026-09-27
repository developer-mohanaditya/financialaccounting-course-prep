import { useEffect, useRef, useState } from 'react';
import { useStudio } from '../state/StudioContext';
import {
  codeMatches,
  createPendingVerification,
  isExpired,
  isValidEmail,
  normaliseEmail,
  type PendingVerification,
} from '../lib/session';
import { IconArrow, IconCheck, IconShield } from '../components/Icons';

type Step = 'entry' | 'verify';

const POINTS = [
  'Ten complete mock exams in the exam-paper format used in the course.',
  'Multiple-choice questions marked +0.50 / −0.25 / 0, exactly as on the paper.',
  'Case questions answered in date, account and amount tables, marked per correct line.',
  'Solutions unlock once an exam has been graded, with the full correct tables.',
  'Every answer and score stays in this browser — nothing is uploaded anywhere.',
];

export function LoginGate() {
  const { signIn } = useStudio();
  const [step, setStep] = useState<Step>('entry');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState<PendingVerification | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'verify') codeRef.current?.focus();
  }, [step]);

  const continueAsGuest = () => {
    signIn({ kind: 'guest', label: 'Guest', startedAt: new Date().toISOString() });
  };

  const sendCode = (event: React.FormEvent) => {
    event.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a complete email address, for example name@school.edu.');
      return;
    }
    setError(null);
    setPending(createPendingVerification(email));
    setCode('');
    setStep('verify');
  };

  const verify = (event: React.FormEvent) => {
    event.preventDefault();
    if (isExpired(pending)) {
      setError('This code has expired. Send a new one to continue.');
      return;
    }
    if (!codeMatches(pending, code)) {
      setError('That code does not match. Enter the six digits shown below.');
      return;
    }
    setError(null);
    signIn({
      kind: 'email',
      label: pending ? normaliseEmail(pending.email) : normaliseEmail(email),
      startedAt: new Date().toISOString(),
    });
  };

  const startOver = () => {
    setPending(null);
    setCode('');
    setError(null);
    setStep('entry');
  };

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
          Your progress is stored only in this browser.
        </p>
      </section>

      <section className="gate-panel">
        {step === 'entry' ? (
          <>
            <div>
              <h2>Begin a study session</h2>
              <p className="muted small" style={{ marginTop: 6 }}>
                Choose how you would like to be identified. Either way, everything you do stays on this device.
              </p>
            </div>

            <button type="button" className="btn btn-primary btn-lg btn-block" onClick={continueAsGuest}>
              Continue as guest <IconArrow />
            </button>

            <div className="gate-divider">or use an email address</div>

            <form className="stack gap-sm" onSubmit={sendCode}>
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
                  }}
                />
              </div>
              <button type="submit" className="btn btn-outline btn-block">
                Send code
              </button>
            </form>

            {error && (
              <div className="callout callout-danger" role="alert">
                {error}
              </div>
            )}

            <p className="tiny muted" style={{ margin: 0 }}>
              No password is used. A six-digit code is generated in this browser for the current session.
            </p>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow">Verification</p>
              <h2>Enter your six-digit code</h2>
              <p className="muted small" style={{ marginTop: 6 }}>
                We generated a code for <strong>{pending?.email}</strong>. Enter it below to open the studio.
              </p>
            </div>

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
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block" disabled={code.length !== 6}>
                Verify and continue
              </button>
            </form>

            {error && (
              <div className="callout callout-danger" role="alert">
                {error}
              </div>
            )}

            <div className="dev-code">
              <span className="row gap-xs">
                <IconShield size={13} />
                Code for this session
              </span>
              <strong>{pending?.code}</strong>
            </div>

            <div className="row gap-sm wrap">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setPending(createPendingVerification(email))}
              >
                Generate a new code
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
                Use a different address
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
