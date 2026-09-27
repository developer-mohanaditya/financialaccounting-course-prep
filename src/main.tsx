import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexReactClient } from 'convex/react';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { App } from './App';
import { StudioProvider } from './state/StudioContext';
import { resolveConvexUrl } from './lib/convexUrl';
import './styles.css';

const container = document.getElementById('root');
if (!container) throw new Error('Root container is missing from the document.');

// The client is used to mark submitted papers and, for a signed-in learner, to
// keep their record in step between devices. The papers themselves are embedded
// in the build, so the studio opens and an exam can be sat with no network at
// all; only submission and syncing need this connection.
const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
if (!convexUrl) {
  throw new Error(
    'VITE_CONVEX_URL is not set. The studio needs it to mark submitted papers.',
  );
}
// `convex dev` writes a loopback address, which only a browser on this machine
// can use; a hosted preview has to be pointed at the platform's public port
// host instead. See the resolver for the rule.
const convex = new ConvexReactClient(
  resolveConvexUrl(convexUrl, window.location.hostname),
);

createRoot(container).render(
  <StrictMode>
    {/* ConvexAuthProvider, not ConvexProvider: it stores the session token and
        exposes the auth hooks. Swapping it back breaks sign-in quietly. */}
    <ConvexAuthProvider client={convex}>
      <StudioProvider>
        <App />
      </StudioProvider>
    </ConvexAuthProvider>
  </StrictMode>,
);
