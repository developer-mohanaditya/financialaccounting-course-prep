# Financial Accounting — Mock Exam Studio

**Live app:** <https://famockexam.freebuff.app>

A browser-only exam-practice workspace for the *Financial Accounting* course (MS Entrepreneuriat).
Ten complete mock exams in the exact format of the course's examination training paper, graded on
submission, with solutions that unlock only after grading.

The **papers run entirely in the browser** — they are embedded in the build, so an exam can be
started, sat and reloaded with no network at all. The **answer keys do not exist in the browser**:
they live in a server function, and the browser posts an answer sheet to be marked. Progress,
scores and session labels are stored in the browser's `localStorage` under a single versioned key;
nothing about a learner is kept on the server.

## Why grading is server-side

A paper can only be marked in the browser if the key is in the browser, and a key in the browser is
a key every student can read. The papers therefore ship redacted: prompts, options, context tables
and structure are all there, but the correct option, the expected entry lines, the schedule values
and every worked explanation are not. The `gradeAttempt` mutation marks a submitted sheet against
the real key and returns the marks and the feedback.

This is the reason the two halves of the code are kept apart:

| Module | Runs in | Holds |
| --- | --- | --- |
| `src/lib/marking.ts`, `src/lib/matching.ts` | server only | the scoring engine and the matching rules |
| `src/lib/meters.ts`, `src/lib/paperKit.ts`, `src/lib/format.ts` | browser | progress counts, answer-sheet shapes, display formatting |
| `src/data/exams`, `src/data/examKit`, `src/data/mcqPool*` | server only | the authored papers, with keys |
| `src/data/learnerExams.generated.ts` | browser | the redacted papers, regenerated on every build |

`npm run verify:bundle` enforces the split: it walks the import graph from `src/main.tsx` and fails
if anything reachable from it touches a keyed module, then scans the built `dist/` for every
key-only string in the papers and fails if one is present. A stale generated module is caught too.

### What a redacted paper still reveals

Deliberately, because the paper itself prints them: the number of entry lines in a transaction,
which schedule cells take an answer, the marks, the options and their labels, and the whole chart of
accounts. It does not reveal which line goes in which cell, or what any of them are worth.

## Signing in

There are two ways in, and neither involves a password.

**As a guest.** Nothing is sent anywhere. The work lives in this browser, and
**Settings → Keep a backup** is the way back from cleared site data.

**With an email address.** A six-digit code is generated **on the server** by
[`@convex-dev/auth`](https://labs.convex.dev/auth), emailed, and has to be typed back. An address
is only an account once it has proved it can receive mail, so a class list of real addresses is the
only way in. Signing in carries any guest work already in the browser up to the account rather than
discarding it.

Sessions, token hashing, refresh and OIDC discovery are the library's job, not ours. An earlier
version of this file hand-rolled all of it; that is the thing to not do.

### Keeping work in step

Progress is written locally **first** and pushed afterwards, so a paper can be sat start to finish
with no connection. When two devices disagree, the merge keeps whichever attempt for each paper is
**further along** — submitted beats unsubmitted — so a graded result is never the thing that gets
overwritten. That is checked directly by `npm run verify:sync`.

The server record is keyed by the learner's **account**, not by the sign-in — `getAuthUserId`, not the
identity's subject, which arrives as `<userId>|<sessionId>`. Signing in again, or from a second
device, therefore finds the same row; keyed on the subject, every sign-in would be a new learner and
two devices would have nothing in common to merge. `src/convex/study.ts` is where that is decided.

### Auth files: do not modify

These four files are the security boundary. They look like boilerplate, and cleaning them up breaks
sign-in *silently* — the database rows stay correct and the app quietly sends everybody back to the
start screen with no error anywhere.

| File | Why it must stay |
| --- | --- |
| `src/convex/auth.config.ts` | self-issued JWT. Must **not** become `customJwt` — that needs a `kid` header and a JWKS URL, which Convex tokens do not have, and the failure is silent. |
| `src/convex/auth.ts` | provider registration. No password or OAuth provider should be added casually. |
| `src/convex/http.ts` | serves OIDC discovery and the JWKS every session token is checked against. Omit it and no token is ever accepted. |
| `src/convex/auth/emailOtp.ts` | the code's randomness, its 15-minute life, and the send itself. |

The schema's `users` table and its `email` index belong to the library too. `emailVerificationTime`
is what answers "is this address proven?" — removing it makes every session look verified.

### Known limits

- **Sends are rate limited, deliveries are not idempotent.** One code per minute and six per hour
  per address (`src/convex/otpLimits.ts`), and Convex Auth separately rate limits *verification*
  attempts, which is the guessable path. A caller who ignores both can still trigger mail, and on
  the default relay there is no dashboard to read that from — the platform owns the sending domain
  and its reputation. The limiter is the backstop.
- **A signed-in session proves an inbox, nothing more.** Nothing sensitive is gated on it — the
  marking endpoint is open, because a guest can hand in a paper and must be marked.
- **The deployed site has no backend of its own; the preview's is local.** Freebuff's hosting serves
  the built `dist/` as files and runs no processes, so the deployment is pointed at the Convex
  project's own deployment (see below), which outlives this workspace and is where a classmate's
  submission, sign-in and progress actually land. The preview keeps using the anonymous backend that
  `convex dev` starts here, so a change under `src/convex/` reaches the live app only when it is
  pushed to it.
- **The preview's sessions are issued for a loopback issuer.** Its `CONVEX_SITE_URL` is fixed at
  `127.0.0.1:3211` and Convex refuses to let it be overridden (`EnvVarNameForbidden`). That is
  harmless: the browser never reads the discovery document — Convex validates the token itself,
  against the JWKS served by the machine that signed it — so the only consequence is that the issuer
  inside a token is not the address the app is served from. The deployed backend's issuer is its own
  public origin.

## Environment

| Variable | Where | What it does |
| --- | --- | --- |
| `VITE_CONVEX_URL` | build time, and production env | the Convex deployment to talk to |
| `SITE_URL` | Convex environment, **required** | the app's own origin; sign-in throws without it |
| `JWT_PRIVATE_KEY`, `JWKS` | Convex environment, **required** | the RS256 pair every session token is signed with |
| `RESEND_API_KEY` | Convex environment, optional | send from your own mail account instead of the relay |
| `OTP_FROM` | Convex environment, optional | the verified sender, e.g. `Mock Exams <no-reply@yourdomain>` |
| `FREEBUFF_EMAIL_KEY` | Convex environment, **required** | the platform relay's key; without it no code can be sent |
| `AUTHOR_ACCESS_KEY` | Convex environment | the content console's key |
| `VITE_AUTHOR_EMAIL` | build time | who the console belongs to; no default |
| `VITE_AUTHOR_ACCESS_KEY` | build time | the console's key; no default |

Email sign-in needs `VITE_CONVEX_URL` at build time, and three things on the deployment. `npx convex
dev` writes the first of those; **the other two are not written by anything and are not optional**:

- **`SITE_URL`** — the app's own origin (`https://…`, no trailing slash). Convex Auth resolves
  redirect URLs through it, and with it unset the send fails *before* the provider is reached:
  `Missing environment variable SITE_URL`, from `redirectAbsoluteUrl` in the library. Set it with
  `npx convex env set SITE_URL https://your-app`. It is a single value, so it names whichever surface
  is *the* app — here the deployment. Nothing in this app's flow follows the redirect it produces
  (codes are typed in, not clicked), so the preview signs in either way.
- **`JWT_PRIVATE_KEY` and `JWKS`** — sessions are RS256 tokens signed with a deployment variable
  (`requireEnv("JWT_PRIVATE_KEY")` in the library). Generate and set both with
  `npm run set:auth-keys`.

Do **not** reach for the library's own `npx @convex-dev/auth` wizard for the keys. It can make them,
but it also edits `tsconfig.json`, adds `src/convex/tsconfig.json` and rewrites the auth files this
repository keeps hand-written. `scripts/convex-auth-keys.mjs` is the one step that is actually
needed, in the same key format (`--force` regenerates the pair and invalidates existing sessions).

The Convex CLI writes a `src/convex/tsconfig.json` of its own when a deployment is created or pushed
to — the environment the functions are typechecked in. Nothing references it, so `npm run typecheck`
is unaffected by it; it is kept because the CLI regenerates it.

**The relay is what makes mail work with no account**: `src/convex/auth/emailOtp.ts` hands the code
to Freebuff's mail relay, which the platform provisions the same way it provisions the Convex
deployment, so there is no mail account to open and no sender to verify before codes arrive.

The relay's key is a **deployment variable, not a constant in the source**: `FREEBUFF_EMAIL_KEY`.
It was a literal here once, and since this repository is public that meant publishing a credential
that would let anyone send mail through the platform's relay. Set it on each deployment with
`npx convex env set FREEBUFF_EMAIL_KEY <key>`, and rotate it by setting the variable again — no
redeploy. A deployment without it refuses to send and names the variable in the error.

Set **both** `RESEND_API_KEY` and `OTP_FROM` and delivery moves to [Resend](https://resend.com)
(3,000 messages a month free) instead. That is the only way to send from your own domain or to see
what bounces — the relay's sending domain, and its reputation, belong to the platform. Two further
consequences worth knowing: the relay only works on a Freebuff-hosted deployment, so a copy of this
app hosted elsewhere needs the Resend pair; and with neither the relay key nor the Resend pair set,
nothing is sent and the sign-in form says so plainly.

**Continue as guest still works** either way — the studio is not blocked on any of this.

## Running it

```bash
npm install
npm run build      # regenerate redacted papers, type-check, build into dist/
npm run preview    # serve the production build
```

The backend is a [Convex](https://convex.dev) deployment holding the marking engine and the
accounts. `npx convex dev` links the repository to one and writes `VITE_CONVEX_URL` to
`.env.local`; `npx convex dev --once` pushes the functions without starting a watcher.

Set the Convex-side variables with `npx convex env set NAME value`, and the production build's with
`freebuff-deploy env set '{"VITE_CONVEX_URL":"…"}'`.

`VITE_CONVEX_URL` is read at build time, and `convex dev` writes the backend's *loopback* address,
which only a browser on this machine can use. So `main.tsx` passes it through
`src/lib/convexUrl.ts`, which leaves a genuinely public URL alone and moves a loopback one onto the
platform's matching public port host — which is what lets a hosted preview reach the backend running
here with no variable rewritten. A deployment can be pointed anywhere by giving the build a genuinely
public URL; failing that it uses the deployment it was built for.

A *deployed* build cannot take the address from that variable at all. Freebuff's hosting keeps
production variables sealed, so what arrives in the bundle is an envelope
(`{"v":"v2","c":…,"k":…}`) rather than the value that was set — an address that is not an address.
So `src/lib/convexUrl.ts` also carries the deployed backend as `DEPLOYED_BACKEND_URL`, used whenever
the configured value is unusable, or is a loopback address on a page served from somewhere else,
which no browser but this machine's could ever reach.

The consequence worth being explicit about: **the two surfaces have separate backends.** The preview
talks to the anonymous backend `convex dev` starts in this workspace, over the platform's public port
host; the deployed site is built with a public URL of its own. Nothing under `src/convex/` is
origin-bound — a backend answers any origin's `OPTIONS` preflight, accepts its `POST`s and upgrades
its WebSocket — so pointing a build at one is a single variable and no function changes to serve it.

### The backend the deployment uses

A deployment is served as files and carries no backend, so it talks to a
[Convex](https://convex.dev) project of its own: **`fa-mockexams`**, production deployment
`adorable-civet-599` → `https://adorable-civet-599.convex.cloud`. That backend outlives this
workspace, so a shared link keeps working whether or not the workspace is running. This workspace's
`convex dev` is deliberately left anonymous and local: the preview is where code is tried out, and
nothing a learner does depends on this machine.

Backend changes reach the deployed app by being pushed to it:

```bash
npm run deploy:backend        # `convex deploy` against prod:adorable-civet-599
npm run set:auth-keys         # only to rotate the pair — invalidates every session
npx convex env set --deployment user-vsr:fa-mockexams:production NAME value
```

The build learns that address from `DEPLOYED_BACKEND_URL` in `src/lib/convexUrl.ts` — see the note
above on why it cannot come from the environment — so moving to another deployment means either
editing that constant, or setting `VITE_CONVEX_URL` for production with
`freebuff-deploy env set '{"VITE_CONVEX_URL":"https://…"}'` and letting a public value win. The
variable is set today as well, holding the same URL, and is kept in case the sealing above is ever
fixed; the constant is what the deployed bundle actually uses.

A second deployment — or a different project — is the same four steps in the order they have to
happen: create it, push to it, generate *its* keys, set *its* `SITE_URL`, then point the build at it.
A deployment with no `JWT_PRIVATE_KEY` cannot sign anybody in, and the keys are per-deployment, so
nothing carries over.

### Development server

```bash
npm run dev:start     # start it detached, on http://127.0.0.1:5273
npm run dev:status    # is it up, and on which pid?
npm run dev:stop      # stop it
npm run dev:restart   # stop, then start
```

`dev:start` hands the server its own session, so it keeps running after the command returns and
survives closing the shell or the editor. Three details make it usable in a sandboxed or shared
machine:

- it binds **loopback only** (`--host 127.0.0.1`), so the server is reachable from this machine and
  nowhere else;
- it refuses to guess — a listener already holding the port, or a server tracked for a different
  address, is reported instead of silently reused;
- output is appended to `.dev/dev-server.log` and the pid to `.dev/dev-server.json`, which is what
  `dev:stop` and `dev:status` read. Both live in `.dev/`, which is ignored by git.

Override the address with the environment: `FA_DEV_PORT=5280 npm run dev:start`. One server is
tracked at a time.

`npm run dev` runs Vite in the foreground, bound to `0.0.0.0` on `$PORT` (default 5173).

`npm run dev:all` runs **Vite and the Convex backend together** and is what a managed preview should
be pointed at. Vite alone is not enough: without a backend on 3210/3211 every query, `signIn` and
`gradeAttempt` fails, and the failure looks like an application bug. Either process exiting stops the
other, so a half-running pair cannot masquerade as a working app.

`npm run preview:single` additionally writes `preview/studio.html`: the whole application inlined
into one portable HTML file that can be opened directly, from a USB stick or a shared folder.

## Verifying it

```bash
npm run typecheck       # TypeScript, project references
npm run verify:exams    # every exam's figures reconcile and every answer key is valid
npm run verify:grading  # the grading engine, exercised across all ten exams
npm run verify:sync     # the cross-device merge never loses a graded result
npm run verify:bundle   # no answer key reaches the browser   (needs a build first)
npm run check           # all of the above, ending with a production build
```

`verify:exams` re-derives each case from its own question text (VAT, depreciation, tax, allocation,
cash-flow subtotals), checks that every journal entry balances, that debit equals credit overall,
that statement schedules add up to their own totals, and that Part Two always carries 15 marks.
`verify:grading` feeds a perfect script, a blank script, a messy script (French number formats,
reordered lines, varied date layouts) and a half-correct script through the engine and asserts the
exact marks awarded.
`verify:sync` checks that a graded result survives every kind of merge, that both sides are kept, and
that merging twice changes nothing.
`verify:bundle` is the security check described above.

## The content console

`/admin` (or `#/admin`) opens a console that reads every paper in full — question paper, answer
key and marking notes — without an attempt or an unlocked sequence. It is named nowhere in the
study interface and linked from nowhere.

It is off unless the build is given credentials, and it re-checks them on the server:

| Variable | Where | Effect |
| --- | --- | --- |
| `VITE_AUTHOR_EMAIL` | build time | who the console belongs to; no default |
| `VITE_AUTHOR_ACCESS_KEY` | build time | the key the console presents; no default |
| `AUTHOR_ACCESS_KEY` | Convex environment | the key the server will accept |

With none of them set, a build has no console at all: `authorConsoleEnabled` is false and the
address means nothing. With them set, a request still has to present a key that matches
`AUTHOR_ACCESS_KEY` on the deployment.

Being straight about the limit: a static client cannot keep a credential from someone who reads
the bundle. What the server-side check buys is **rotation** — change `AUTHOR_ACCESS_KEY` and every
already-deployed build stops working immediately, with no redeploy. Turn the console off entirely
by unsetting it; the study interface is unaffected either way.

## Exam format

Mirrors the examination training handout:

| Part | Content | Duration | Marks |
| --- | --- | --- | --- |
| Part One | 10 multiple-choice questions | 20 minutes | / 5 |
| Part Two | Case: numbered transactions, entry tables and statement schedules | 2 h 25 | / 15 |
| **Total** | | **3 hours** | **/ 20** |

Marking, exactly as printed on the paper:

- **Part One** — correct `+0.50`, incorrect `−0.25`, *Don't know* `0`.
- **Part Two** — the marks printed with each transaction (`(1 pt)`, `(2 pts)`) are divided equally
  between its entry lines. A line scores only when its date, account category, account number,
  wording and debit/credit amount all agree with the answer key. Schedule rows inside a case are
  marked per correct cell.

The chart of accounts used by every exam is the one annexed to the training handout (accounts 10–69
and 70–78), with French account numbering and the course's account wording. The annex travels with
the paper: it is reproduced on the exam overview, reachable from the runner toolbar, and available
inside every entry question (with a search box), so the exact wording expected on a line is always
to hand.

Entry tables behave like the printed sheet:

- **×** empties the values on that line; the line itself stays, and lines added on top of the
  expected ones are dropped again once they are empty.
- **Blank lines are never marked.** They cannot pair with an expected line, they are removed when the
  exam is submitted, they do not count towards the progress meter, and the solution review reports
  them as *not attempted* rather than showing an empty row.

## Progression

Mock Exam 1 is available immediately; each following exam unlocks as soon as the previous one has
been submitted and graded. No minimum score is required. Locked exams show a lock indicator, hide
their question content, and cannot be reached by any route in the application. Solutions are sealed
until the paper has been graded, so nothing can be read ahead of time.

## Project layout

```
src/
  convex/
    exams.ts                      gradeAttempt (marks a sheet) and authorPaper (content console)
    study.ts                      me, loadProgress, saveProgress — keyed on the Convex Auth identity
    auth.ts                       provider registration                (do not modify — see README)
    auth.config.ts                self-issued JWT config               (do not modify — see README)
    http.ts                       OIDC discovery routes                (do not modify — see README)
    auth/emailOtp.ts              the six-digit code and its delivery  (do not modify — see README)
    otpLimits.ts                  per-address send rate limiting
    schema.ts                     Convex Auth's tables + studyProgress + otpSends
  data/
    exams/exam01.ts … exam10.ts   ten complete papers: case data, entries, keys, explanations
    exams/index.ts                ordered single source of truth for the ten exams
    examKit.ts                    blueprint → exam assembly                      (server only)
    mcqPool{A,B,C,D}.ts           100 distinct multiple-choice questions          (server only)
    learnerExams.generated.ts     the redacted papers the browser runs            (generated)
    chartOfAccounts.ts            the handout's chart of accounts
  lib/
    types.ts                      exam, question, answer and result types
    marking.ts                    the scoring engine                              (server only)
    matching.ts                   amount / date / account matching rules          (server only)
    redact.ts                     key removal, and the guard that checks it       (server only)
    meters.ts                     progress counts across a paper
    paperKit.ts                   blank / reconciled / pruned answer sheets
    answerSheet.ts                the empty entry row, and what counts as blank
    format.ts                     display formatting and text normalisation
    convexUrl.ts                  where the backend is, as this browser reaches it
    useGrading.ts                 the browser's route to the marking service
    useAuth.ts                    asking for a code, handing it back, ending a session
    useSync.ts                    local-first sync, and the merge on conflict
    merge.ts                      which attempt wins when two devices disagree
    session.ts                    the session as the interface displays it
    useAuthorPapers.ts            the console's route to the full papers
    progress.ts                   exam status, sequential unlocking, summary statistics
    storage.ts                    versioned namespaced persistence, migration, backup
  state/StudioContext.tsx         session, routes, answer writing, submission, reset
  components/, pages/             shell, sidebar, question renderers, overview/runner/results/review
  styles.css                      the calm academic theme, light and dark
public/favicon.svg                the browser-tab mark, drawn in the app's own colours
scripts/                          dev server, source extraction, paper generation, verification, bundling
```

## Storage

One key, `financialAccountingMockStudio_v1`:

```jsonc
{
  "version": 1,
  "session": { "kind": "guest" | "email", "label": "…", "startedAt": "…" },
  "attempts": {
    "exam-01": {
      "startedAt": "…", "submittedAt": "…", "elapsedMs": 0, "lastRunStartedAt": "…",
      "answers": { "mcq": {}, "entries": {}, "schedules": {} },
      "result": { "awarded": 0, "possible": 20, "questions": [] }
    }
  },
  "activeExamId": "exam-01",
  "theme": "system",
  "lastVisited": "exam:exam-01"
}
```

`migrate()` in `src/lib/storage.ts` validates every field and rebuilds a clean state for unknown or
future schema versions, so a change to the shape cannot silently corrupt saved progress. If
`localStorage` is unavailable (private browsing, some `file://` contexts) the studio keeps working
from an in-memory copy and says so in Settings.

**Settings → Keep a backup** copies the whole record to the clipboard, downloads it as a file, or
restores one. Because progress lives in one browser and nowhere else, this is the way back from
cleared site data, a new device, or a phone that decided to forget. A restore is validated through
the same `migrate` before it replaces anything, so a bad paste changes nothing.

Drafts are written as soon as an answer changes, through a short debounce, and flushed on
`beforeunload`/`pagehide`. A reload reopens the exam overview of the paper you were working on,
never the answer sheet itself.

**Settings → Reset progress** deletes the key and returns to the start screen.

## Source material

The exams were authored from the course material supplied for the course: the examination training
paper (structure, question types, marking), the previous year's final quiz and its corrected answers
(difficulty and solution style), the session 1–7 slides (permissible topic scope, including income
tax, profit distribution and the cash-flow statement) and the Verdi and Windsurf case handouts
(applied-case complexity).

That material belongs to the course and its professor — the slides, handouts, exercise cases and the
previous year's quiz are deliberately **not** distributed here. They sit in a local `Financial
Accounting/` folder that git ignores, along with the plain-text extractions used while authoring
(`.extract/`). Only the app, and the mock exams written for it, are published.


Company names, dates, figures and options in the ten papers are newly written; the concepts, the
paper structure and the marking scheme follow the training handout.
