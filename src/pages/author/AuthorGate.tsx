import { useState } from 'react';
import { useStudio } from '../../state/StudioContext';
import { leaveAuthorRoute } from '../../lib/author';

/**
 * Access screen for the content console.
 *
 * Deliberately plain: it names nothing, describes nothing and gives no clue about
 * what lies behind it, so a learner who lands on this address learns only that the
 * page is not for them.
 */
export function AuthorGate() {
  const { grantAuthor } = useStudio();
  const [email, setEmail] = useState('');
  const [key, setKey] = useState('');
  const [failed, setFailed] = useState(false);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (grantAuthor(email, key)) {
      setFailed(false);
      return;
    }
    setFailed(true);
    setKey('');
  };

  return (
    <div className="console-gate">
      <section className="panel panel-pad console-gate-card">
        <h1>Access</h1>
        <p className="muted small" style={{ marginTop: 6 }}>
          This page is not part of the study workspace.
        </p>

        <form className="stack gap-sm mt" onSubmit={submit}>
          <div className="field">
            <label className="field-label" htmlFor="access-email">
              Email address
            </label>
            <input
              id="access-email"
              type="email"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setFailed(false);
              }}
            />
          </div>

          <div className="field">
            <label className="field-label" htmlFor="access-key">
              Access key
            </label>
            <input
              id="access-key"
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(event) => {
                setKey(event.target.value);
                setFailed(false);
              }}
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block">
            Continue
          </button>
        </form>

        {failed && (
          <div className="callout callout-danger" role="alert">
            Those credentials were not recognised.
          </div>
        )}

        <button type="button" className="btn btn-ghost btn-sm mt" onClick={leaveAuthorRoute}>
          Leave this page
        </button>
      </section>
    </div>
  );
}
