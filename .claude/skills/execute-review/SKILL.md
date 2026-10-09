---
name: execute-review
description: Code review — review and stabilize a feature's code for compliance with the project rules, adherence to the TechSpec and tasks, and tests, with a final report and verdict. Use when the user asks to review code, run a code review, validate compliance with the rules, or fix problems found during review. Do not use to validate behavior in QA (execute-qa) or to implement new tasks.
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. Read the project's `AGENTS.md`. In `tasks/prd-[slug]/`, read `techspec.md` and `tasks.md`; consult `prd.md` only when needed to clarify a requirement. Generate `codereview.md` in the same folder.

Check the project rules and the TechSpec before pointing out any problem. Run the tests and validations required by `AGENTS.md` before recording the verdict; the review can only be **APPROVED** when all applicable tests pass.

## Workflow

1. **Analyze** — read `AGENTS.md`, all rules in `.claude/rules/`, the TechSpec (expected architecture), and the tasks (implemented scope). Load only the applicable project skills in `.claude/skills/`.
   **Done when:** the expected architecture, scope, rules, and applicable skills are clear.

2. **Rules compliance** — check each change against the applicable project rules in `.claude/rules/`. Record each violation and the corresponding rule.
   **Done when:** each change has been checked against the applicable rules.

3. **TechSpec adherence** — compare the implementation with what was specified:
   - [ ] Architecture as specified
   - [ ] Components, interfaces, and contracts as defined
   - [ ] Data models as documented
   - [ ] Endpoints/APIs and integrations, when applicable, as specified

   **Done when:** each TechSpec decision has been confirmed as implemented or recorded as a justified deviation.

4. **Task completeness** — for each task marked as complete, verify that the code was implemented, the related acceptance criteria are traced, the subtasks were completed, and the task's tests are present. Functional validation of the criteria remains QA's responsibility.
   **Done when:** each task marked as complete meets all four points.

5. **Tests** — read the test, validation, build, and coverage commands defined in `AGENTS.md` and run the applicable commands within each affected application. If any command requires the application to be running, prepare an isolated environment for the worktree: use an available port in the `30**` range (for example, `3000–3099`) for `apps/web`, started with `pnpm --filter @refresh/web dev --port <port>` (Next.js serves the UI and the `/api/scans` Route Handlers). When the scope involves scanning, also start `apps/scan-worker`, a Fastify HTTP service that listens on `127.0.0.1:3001` by default (also in the `30**` range; pick another free `30**` port if 3001 is taken): `SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> SCAN_CALLBACK_URL=http://127.0.0.1:<web-port>/api/internal/scans SCAN_WORKER_PORT=<worker-port> pnpm --filter @refresh/scan-worker dev`. Give `apps/web` the same tokens, the worker URL, and the database (`SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> SCAN_WORKER_URL=http://127.0.0.1:<worker-port> DATABASE_URL=<url>`, or set them in `apps/web/.env.local`); both tokens must be at least 32 characters and different from each other (`openssl rand -hex 32`). The web app needs PostgreSQL: start the local one with `pnpm db:up` (port `5432`) and apply migrations with `DATABASE_URL=postgresql://refresh:refresh@127.0.0.1:5432/refresh pnpm db:migrate`; stop it with `pnpm db:down` when done. The E2E suite (`pnpm test:e2e`) starts its own Testcontainers Postgres, fixture server, worker, and web app on ports `3090–3093` (override with `E2E_WEB_PORT`, `E2E_WORKER_PORT`, `E2E_FIXTURES_PORT`, `E2E_CLOSED_PORT`), so stop anything on those ports first. Use a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, pick another one within the range. Configure the URLs between services, record the ports and processes started, and do not assume commands or tools that are not defined in the project.
   **Done when:** all applicable commands defined in `AGENTS.md` have been run, with tests passing and the minimum coverage met when applicable.

6. **Fix and revalidate** — for each problem found:
   - fix the root cause and adjust or create the necessary tests;
   - if the fix requires changing the PRD, the TechSpec, or the scope, record the problem as a blocker and ask the user for a decision;
   - run the tests again and repeat the relevant checks.

   **Done when:** there are no blocking problems and the relevant tests and checks have been run again.

7. **Report** — generate `codereview.md` following this skill's `./references/TEMPLATE.md`, with the verdict:
   - **APPROVED** — criteria met, tests passing, code compliant with the rules and the TechSpec.
   - **APPROVED WITH RESERVATIONS** — main criteria met; improvements recommended but not blocking.
   - **REJECTED** — failing tests, serious standards violation, lack of adherence to the TechSpec, or a security problem.

   **Done when:** `codereview.md` is saved according to the template, with the verdict recorded.

8. **Shut down the environment** — shut down every service started by this run, stop the processes gracefully, and confirm that ports, temporary databases, containers, and other resources were released. Do not stop processes belonging to another worktree or to the user. Do this cleanup even if the review is interrupted, blocked, or rejected.
