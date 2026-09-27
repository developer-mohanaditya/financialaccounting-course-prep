# Financial Accounting — Mock Exam Studio

A browser-only exam-practice workspace for the *Financial Accounting* course (MS Entrepreneuriat).
Ten complete mock exams in the exact format of the course's examination training paper, graded
immediately in the browser, with solutions that unlock only after submission.

There is no backend, no database and no analytics. Every answer, score, unlock state and session
label lives in the browser's `localStorage` under a single versioned key.

## Running it

```bash
npm install
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

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

`npm run dev` still runs Vite in the foreground if you prefer it attached to your terminal.

`npm run preview:single` additionally writes `preview/studio.html`: the whole application inlined
into one portable HTML file that can be opened directly, from a USB stick or a shared folder.

## Verifying it

```bash
npm run typecheck      # TypeScript, project references
npm run verify:exams   # every exam's figures reconcile and every answer key is valid
npm run verify:grading # the grading engine, exercised across all ten exams
npm run check          # all of the above plus a production build
```

`verify:exams` re-derives each case from its own question text (VAT, depreciation, tax, allocation,
cash-flow subtotals), checks that every journal entry balances, that debit equals credit overall,
that statement schedules add up to their own totals, and that Part Two always carries 15 marks.
`verify:grading` feeds a perfect script, a blank script, a messy script (French number formats,
reordered lines, varied date layouts) and a half-correct script through the engine and asserts the
exact marks awarded.

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
  data/
    exams/exam01.ts … exam10.ts   ten complete papers: case data, entries, keys, explanations
    exams/index.ts                ordered single source of truth for the ten exams
    examKit.ts                    blueprint → exam assembly, blank/reconciled answer sheets
    mcqPool{A,B,C,D}.ts           100 distinct multiple-choice questions with option rationales
    chartOfAccounts.ts            the handout's chart of accounts
  lib/
    types.ts                      exam, question, answer and result types
    grading.ts                    the scoring engine (Part One, entry lines, schedule cells)
    format.ts                     amount, date and account-wording normalisation
    progress.ts                   exam status, sequential unlocking, summary statistics
    storage.ts                    versioned namespaced persistence + migration
  state/StudioContext.tsx         session, routes, answer writing, submission, reset
  components/, pages/             shell, sidebar, question renderers, overview/runner/results/review
  styles.css                      the calm academic theme, light and dark
scripts/                          detached dev server, source extraction, exam + grading verification, bundling
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

Drafts are written as soon as an answer changes, through a short debounce, and flushed on
`beforeunload`/`pagehide`. A reload reopens the exam overview of the paper you were working on,
never the answer sheet itself.

**Settings → Reset progress** deletes the key and returns to the start screen.

## Session gate

Two entry paths, both local: *Continue as guest*, or an email address plus a six-digit code. The code
is generated in the browser and shown in a small helper area on the verification screen — no email is
sent and nothing leaves the device. The session only decides the label shown in the sidebar and
Settings.

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
