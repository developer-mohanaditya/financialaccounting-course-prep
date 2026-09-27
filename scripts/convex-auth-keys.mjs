// The signing keys Convex Auth needs, set without its setup wizard.
//
// `@convex-dev/auth` signs every session token with a deployment environment
// variable and refuses to work without it:
//
//     node_modules/@convex-dev/auth/dist/server/implementation/tokens.js
//       importPKCS8(requireEnv("JWT_PRIVATE_KEY"), "RS256")
//
// Its own CLI (`npx @convex-dev/auth`) can create that pair, but it also edits
// `tsconfig.json`, adds `src/convex/tsconfig.json` and rewrites the auth files
// this repository keeps hand-written and documented as "do not modify". This
// script does exactly the one step that is needed — the same key format the
// wizard produces, byte for byte:
//
//     generateKeyPair("RS256")
//     JWT_PRIVATE_KEY = PKCS8 PEM, trailing newline trimmed, newlines -> spaces
//     JWKS            = {"keys":[{"use":"sig", ...publicJwk}]}
//
// Both are written through `npx convex env set`, so the deployment stays the
// single source of truth and nothing sensitive lands in a file here.
//
// Usage: node scripts/convex-auth-keys.mjs [--force]
//        Run it against whatever deployment is currently configured.

import { execFileSync } from 'node:child_process';
import { generateKeyPairSync } from 'node:crypto';

const force = process.argv.includes('--force');

/**
 * Ask the deployment for a variable. Read, never printed.
 *
 * An unset variable makes the CLI exit non-zero, and a *set* one has a shape we
 * can recognise, so the answer is confirmed against that shape rather than
 * trusting "non-empty" — a diagnostic line caught in stdout must not be
 * mistaken for a key that is already configured.
 */
function readVar(name, looksRight) {
  try {
    const value = execFileSync('npx', ['convex', 'env', 'get', name], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return looksRight(value) ? value : '';
  } catch {
    return '';
  }
}

/**
 * `--` is not decoration: the private key starts with `-----`, which the CLI's
 * argument parser reads as an option and rejects. Its own wizard passes `--`
 * before the name for exactly this reason.
 */
function setVar(name, value) {
  execFileSync('npx', ['convex', 'env', 'set', '--', name, value], { stdio: 'inherit' });
}

const hasPrivateKey = readVar('JWT_PRIVATE_KEY', (v) => v.startsWith('-----BEGIN')) !== '';
const hasJwks = readVar('JWKS', (v) => v.startsWith('{')) !== '';

if ((hasPrivateKey || hasJwks) && !force) {
  console.log('JWT_PRIVATE_KEY and JWKS are already set on this deployment.');
  console.log('Pass --force to replace them (this invalidates every existing session).');
  process.exit(0);
}

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

// Node's `export({ format: 'jwk' })` gives { kty, n, e } for RSA — the same
// shape jose's exportJWK returns, which is what the wizard stores.
const jwk = publicKey.export({ format: 'jwk' });
const pkcs8 = privateKey
  .export({ type: 'pkcs8', format: 'pem' })
  .trimEnd()
  .replace(/\n/g, ' ');

setVar('JWT_PRIVATE_KEY', pkcs8);
setVar('JWKS', JSON.stringify({ keys: [{ use: 'sig', ...jwk }] }));

console.log('Signing keys set. Existing sessions, if any, are now invalid.');
