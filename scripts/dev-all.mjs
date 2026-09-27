// The managed dev entry point: the Convex backend *and* the Vite server.
//
// `npm run dev` alone starts Vite and nothing else, which leaves every query,
// `signIn` and `gradeAttempt` failing against a port nothing is listening on.
// The backend is not optional — it holds the answer keys and issues the session
// tokens — so it is started here, alongside the web server, by the single
// command the platform supervises.
//
// Either process dying takes the other down with it: a half-running pair is the
// failure that looks like an application bug, and it is better to stop loudly.
//
// Usage: npm run dev:all   (or FA_DEV_PORT / $PORT to move the web server)

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = process.env.PORT || process.env.FA_DEV_PORT || '5173';

const children = [];
let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
  }
  // Give both a moment to unwind, then exit regardless: a hung child must not
  // hold the preview port hostage.
  setTimeout(() => process.exit(code), 1500).unref();
}

function start(name, bin, args) {
  const child = spawn(bin, args, { cwd: root, stdio: 'inherit', env: process.env });
  children.push(child);
  child.on('error', (error) => {
    console.error(`[dev-all] could not start ${name}: ${error.message}`);
    stop(1);
  });
  child.on('exit', (code, signal) => {
    if (stopping) return;
    console.error(`[dev-all] ${name} exited (${signal ?? code}); stopping the other process.`);
    stop(code ?? 1);
  });
  return child;
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));

start('convex', path.join(root, 'node_modules', '.bin', 'convex'), ['dev']);
start('vite', path.join(root, 'node_modules', '.bin', 'vite'), [
  '--configLoader',
  'native',
  '--host',
  '0.0.0.0',
  '--port',
  port,
]);
