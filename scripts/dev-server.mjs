#!/usr/bin/env node
/**
 * Detached development server for the studio.
 *
 *   npm run dev:start     start (or reuse) the server, detached from this shell
 *   npm run dev:status    is it up, and on which pid?
 *   npm run dev:stop      stop it and remove the record
 *   npm run dev:restart   stop, then start
 *
 * The server is given its own session by the operating system, so it keeps
 * running after the command that started it returns. Its output is appended to
 * .dev/dev-server.log and its pid, host and port are recorded in
 * .dev/dev-server.json, which is what `stop` and `status` read.
 *
 * The address defaults to 127.0.0.1:5273 — loopback only, so the server is
 * reachable from this machine and nowhere else. Override it with FA_DEV_HOST /
 * FA_DEV_PORT:
 *
 *   FA_DEV_PORT=5280 npm run dev:start
 *
 * One server is tracked at a time: the record is only trusted for the address it
 * was created for, and a listener already holding the requested port is reported
 * rather than silently reused.
 *
 * `--configLoader native` is passed because Vite's configuration bundler hangs in
 * some sandboxed environments; the native loader reads vite.config.ts directly.
 */

import { spawn } from 'node:child_process';
import {
  appendFileSync,
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const runDir = path.join(root, '.dev');
const stateFile = path.join(runDir, 'dev-server.json');
const logFile = path.join(runDir, 'dev-server.log');

const host = process.env.FA_DEV_HOST ?? '127.0.0.1';
const port = Number(process.env.FA_DEV_PORT ?? 5273);
const url = `http://${host}:${port}/`;

const READY_ATTEMPTS = 60;
const READY_GAP_MS = 250;

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

/** The recorded server, or null when the record is missing or unusable. */
function readRecord() {
  if (!existsSync(stateFile)) return null;
  try {
    const record = JSON.parse(readFileSync(stateFile, 'utf8'));
    if (!record || typeof record.pid !== 'number' || record.pid <= 0) return null;
    return record;
  } catch {
    return null;
  }
}

/** The recorded server, but only when it was started for the requested address. */
function recordForThisAddress() {
  const record = readRecord();
  if (!record) return null;
  return record.host === host && record.port === port ? record : null;
}

function alive(pid) {
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

/** One HTTP probe. Resolves { ok: false } for any connection or protocol error. */
function probe(timeoutMs = 700) {
  return new Promise((resolve) => {
    const request = http.get(url, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        if (body.length < 4096) body += chunk;
      });
      response.on('end', () => resolve({ ok: true, status: response.statusCode, body }));
    });
    request.setTimeout(timeoutMs, () => request.destroy());
    request.on('error', () => resolve({ ok: false }));
  });
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function probeUntilReady() {
  for (let attempt = 0; attempt < READY_ATTEMPTS; attempt += 1) {
    const result = await probe();
    if (result.ok) return result;
    await wait(READY_GAP_MS);
  }
  return { ok: false };
}

async function waitForExit(pid, attempts, gapMs) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!alive(pid)) return true;
    await wait(gapMs);
  }
  return !alive(pid);
}

function logTail(lines = 20) {
  if (!existsSync(logFile)) return '(no log yet)';
  return readFileSync(logFile, 'utf8').trimEnd().split('\n').slice(-lines).join('\n');
}

/** The hint block printed after a successful start. */
function describe(pid) {
  return [
    `  url    ${url}`,
    `  pid    ${pid}`,
    `  log    ${path.relative(root, logFile)}`,
    `  stop   npm run dev:stop`,
  ].join('\n');
}

/* ------------------------------------------------------------------ */
/* actions                                                             */
/* ------------------------------------------------------------------ */

async function start() {
  mkdirSync(runDir, { recursive: true });

  const record = readRecord();
  const mine = recordForThisAddress();

  if (mine && alive(mine.pid)) {
    const result = await probe();
    if (result.ok) {
      console.log(`✓ Already running on ${url} (pid ${mine.pid}).`);
      console.log(describe(mine.pid));
      return;
    }
    rmSync(stateFile, { force: true }); // recorded for this address, but no longer serving it
  } else if (mine) {
    rmSync(stateFile, { force: true }); // stale record for this address
  } else if (record && alive(record.pid)) {
    console.error(
      `✗ A dev server is already tracked on http://${record.host}:${record.port}/ (pid ${record.pid}).`,
    );
    console.error('  This script tracks one server at a time. Either stop it first:');
    console.error('    npm run dev:stop');
    console.error('  or start on the port it already uses.');
    process.exitCode = 1;
    return;
  } else if (record) {
    rmSync(stateFile, { force: true }); // stale record for another address
  }

  const occupied = await probe();
  if (occupied.ok) {
    console.error(`✗ ${url} is already answering, and not from a server this script started.`);
    console.error('  Stop that process, or start this one on another port:');
    console.error('    FA_DEV_PORT=5280 npm run dev:start');
    process.exitCode = 1;
    return;
  }

  const vite = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!existsSync(vite)) {
    console.error('✗ Vite is not installed. Run: npm install');
    process.exitCode = 1;
    return;
  }

  appendFileSync(logFile, `\n--- ${new Date().toISOString()} · starting on ${url} ---\n`);
  const log = openSync(logFile, 'a');
  const child = spawn(
    process.execPath,
    [vite, '--configLoader', 'native', '--host', host, '--port', String(port), '--strictPort'],
    { cwd: root, detached: true, stdio: ['ignore', log, log] },
  );
  child.unref();
  closeSync(log);
  writeFileSync(
    stateFile,
    `${JSON.stringify({ pid: child.pid, host, port, url, startedAt: new Date().toISOString() }, null, 2)}\n`,
  );

  const ready = await probeUntilReady();
  if (!ready.ok) {
    console.error(`✗ No answer on ${url} after ${(READY_ATTEMPTS * READY_GAP_MS) / 1000}s. Last log lines:`);
    console.error(logTail());
    if (alive(child.pid)) process.kill(child.pid, 'SIGTERM');
    rmSync(stateFile, { force: true });
    process.exitCode = 1;
    return;
  }

  console.log(`✓ Dev server started on ${url}`);
  console.log(describe(child.pid));
}

async function stop() {
  const record = readRecord();

  if (!record) {
    console.log('○ The dev server is not running.');
    return;
  }

  const target = `http://${record.host}:${record.port}/`;

  if (!alive(record.pid)) {
    rmSync(stateFile, { force: true });
    console.log(`○ The dev server was not running; removed the stale record (pid ${record.pid}).`);
    return;
  }

  process.kill(record.pid, 'SIGTERM');
  if (!(await waitForExit(record.pid, 40, 100))) {
    process.kill(record.pid, 'SIGKILL');
    await waitForExit(record.pid, 20, 100);
  }
  rmSync(stateFile, { force: true });
  console.log(`✓ Dev server stopped (${target}, pid ${record.pid}).`);
  console.log(`  Log kept in ${path.relative(root, logFile)}.`);
}

async function status() {
  const record = readRecord();
  const result = await probe();

  if (record && alive(record.pid) && record.host === host && record.port === port && result.ok) {
    console.log(`✓ Running on ${url} (pid ${record.pid}).`);
    return;
  }
  if (record && alive(record.pid)) {
    console.log(
      `✓ Running on http://${record.host}:${record.port}/ (pid ${record.pid}).`,
    );
    if (record.port !== port || record.host !== host) {
      console.log(`  (a different address from the one this command defaults to: ${url})`);
    }
    return;
  }
  if (result.ok) {
    console.log(`? ${url} answers, but not from a server this script started.`);
    return;
  }
  console.log('○ Not running.');
  if (record) console.log(`  (stale record for pid ${record.pid}; \`npm run dev:start\` will clear it)`);
}

/* ------------------------------------------------------------------ */

const action = process.argv[2] ?? 'status';

switch (action) {
  case 'start':
    await start();
    break;
  case 'stop':
    await stop();
    break;
  case 'status':
    await status();
    break;
  case 'restart':
    await stop();
    await start();
    break;
  default:
    console.error(`Unknown action "${action}".`);
    console.error('Usage: node scripts/dev-server.mjs <start|stop|status|restart>');
    process.exitCode = 1;
}
