---
name: execute-qa
description: "QA — validate and stabilize an implemented feature against the PRD, TechSpec, and tasks: unit, integration, and E2E tests with the available browser tool, accessibility, responsiveness, fixing the bugs found, and a final report with evidence. Use when the user asks to run QA. Do not use to implement new tasks or to review code (execute-review)."
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. Read the project's `AGENTS.md`. In `tasks/prd-[slug]/`, read `prd.md`, `techspec.md`, and `tasks.md`; generate and maintain `qa.md` with the defects, fixes, regression tests, and evidence. Save all browser tool evidence to `tasks/prd-[slug]/evidences/`.

QA is only **APPROVED** when every acceptance criterion in the PRD has been verified and is met. If you find bugs, fix them at the root cause, create regression tests, and repeat the validation. For UI flows, use the browser tool available in the environment, such as Playwright MCP, Vercel Agent Browser, or an equivalent tool.

## Workflow

1. **Analyze** — read `AGENTS.md`, all rules in `.claude/rules/`, the PRD, the TechSpec, and every task file; build a checklist with one verification item per acceptance criterion (`AC-*`) and link the corresponding test cases (`TU-*`, `TI-*`, and `E2E-*`).
   **Done when:** every acceptance criterion in the PRD has a verification item and at least one linked test case.

2. **Prepare the environment** — bring up the services needed for validation in an environment isolated to the worktree. Use an available port in the `30**` range (for example, `3000–3099`) for `apps/web`, started with `pnpm --filter @refresh/web dev --port <port>` (Next.js serves the UI and the `/api/scans` Route Handlers). When the scope involves scanning, also start `apps/scan-worker`, a Fastify HTTP service that listens on `127.0.0.1:3001` by default (also in the `30**` range; pick another free `30**` port if 3001 is taken): `SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> SCAN_CALLBACK_URL=http://127.0.0.1:<web-port>/api/internal/scans SCAN_WORKER_PORT=<worker-port> pnpm --filter @refresh/scan-worker dev`. Give `apps/web` the same tokens, the worker URL, and the database (`SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> SCAN_WORKER_URL=http://127.0.0.1:<worker-port> DATABASE_URL=<url>`, or set them in `apps/web/.env.local`); both tokens must be at least 32 characters and different from each other (`openssl rand -hex 32`). The web app needs PostgreSQL: start the local one with `pnpm db:up` (port `5432`) and apply migrations with `DATABASE_URL=postgresql://refresh:refresh@127.0.0.1:5432/refresh pnpm db:migrate`; stop it with `pnpm db:down` when done. The E2E suite (`pnpm test:e2e`) starts its own Testcontainers Postgres, fixture server, worker, and web app on ports `3090–3093` (override with `E2E_WEB_PORT`, `E2E_WORKER_PORT`, `E2E_FIXTURES_PORT`, `E2E_CLOSED_PORT`), so stop anything on those ports first. Use a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, pick another one within the range. Configure the URLs between services, record the ports and processes started, and open the application with the available browser tool.
   **Done when:** the required services respond, the home page is loaded, and the URLs and ports used are recorded.

3. **Test each flow (E2E)** — for each acceptance criterion with a UI flow, run the corresponding E2E case using the available browser tool and verify the expected result in the application state. On unexpected behavior, investigate the UI state, browser console messages, API requests and responses, and backend logs before recording or fixing the bug. Capture visual evidence, save it to `tasks/prd-[slug]/evidences/`, mark the result as PASSED or FAILED, and record each failure in `qa.md`.

   **Done when:** every acceptance criterion with a UI flow is marked as PASSED or FAILED, with evidence.

4. **Run the TechSpec test cases** — run the unit (`TU-*`) and integration (`TI-*`) test cases linked to the acceptance criteria, when applicable, using the commands defined in `AGENTS.md` and the applicable rules. When the project defines a coverage target, verify it using the mechanisms available in the stack and record the result in `qa.md`. Also record each case's result in the checklist and each failure in `qa.md`.
   **Done when:** all unit and integration test cases linked to the criteria have been run or are explicitly blocked.

5. **Check accessibility** — on each screen, use the available browser tool to test keyboard navigation and verify labels and semantics:
   - [ ] Keyboard navigation (Tab, Enter, Esc)
   - [ ] Interactive elements with descriptive labels
   - [ ] Images with appropriate alternative text (`alt`)
   - [ ] Adequate color contrast
   - [ ] Forms with labels associated to fields
   - [ ] Clear and accessible error messages
   - [ ] Appropriately sized fonts

   **Done when:** each item has been checked on each screen.

6. **Check visuals and responsiveness** — capture the main screens, save them to `tasks/prd-[slug]/evidences/`, cover the states (empty, with data, and error) and the main breakpoints, and document any inconsistencies.
   **Done when:** the main states and breakpoints are captured and the inconsistencies are documented.

7. **Fix the bugs found** — for each bug recorded in `qa.md`:
   - locate and fix the root cause, without masking the symptom;
   - create a regression test that fails without the fix;
   - record in `qa.md` the status, the fix applied, and the test created;
   - if the fix requires changing the PRD, the TechSpec, or the scope, stop and ask the user for a decision.

   **Done when:** each bug recorded in `qa.md` has a fix and a regression test, or is explicitly blocked by a user decision.

8. **Revalidate** — repeat the flows that failed, run the regression tests, and re-verify the affected acceptance criteria. If any validation fails, go back to step 7.
   **Done when:** all acceptance criteria are marked as PASSED, with no unresolved bugs.

9. **Report** — generate `qa.md` following this skill's `./references/TEMPLATE.md`, including the fixed bugs, regression tests, and final evidence.
   **Done when:** `qa.md` is generated according to the template and updated with the final results.

10. **Shut down the environment** — shut down every service started by this run, stop the processes gracefully, and confirm that ports, temporary databases, containers, and other resources were released. Do not stop processes belonging to another worktree or to the user. Do this cleanup even if QA is interrupted, blocked, or rejected.
