---
name: execute-task
description: Task — identify and implement the next task of a feature from the PRD, TechSpec, and tasks.md, marking it as completed at the end. Use when the user asks to execute, implement, or start a task/subtask, or to continue implementing a feature. Do not use to review (execute-review) or QA-validate (execute-qa) what is already implemented.
argument-hint: --prd feature-name
---

The `--prd` argument identifies the feature slug. Without an argument, locate the folder in `./tasks/prd-*/`. The required files in `tasks/prd-[slug]/` are `prd.md`, `techspec.md`, and `tasks.md`; if any is missing, stop and point to the corresponding skill (`/create-prd`, `/create-techspec`, or `/create-tasks`).

A task is an **incremental deliverable**, with explicit dependencies and its own tests. Implement all subtasks and move from plan to implementation as soon as the approach is clear. Reference `techspec.md` instead of repeating implementation details.

## Workflow

1. **Select the task** — identify the next incomplete task in `tasks.md`; open the corresponding `task_[num].md` file and read its definition, subtasks (`[num].1`, `[num].2`…), related acceptance criteria, and tests.
   **Done when:** the next task and all its subtasks are identified.

2. **Prepare** — read `AGENTS.md` and all rules in `.claude/rules/`; review the PRD context and the TechSpec requirements for the task; understand the dependencies on previous tasks; load only the applicable project skills in `.claude/skills/` and consult the web documentation of the libraries involved when needed.
   When the task requires running the application, prepare an isolated environment for the worktree: use an available port in the `30**` range (for example, `3000–3099`) for `apps/web`, started with `pnpm --filter @refresh/web dev --port <port>` (Next.js serves the UI and the `/api/scans` Route Handlers). When the scope involves scanning, also start `apps/scan-worker`, a Fastify HTTP service that listens on `127.0.0.1:3001` by default (also in the `30**` range; pick another free `30**` port if 3001 is taken): `SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> SCAN_CALLBACK_URL=http://127.0.0.1:<web-port>/api/internal/scans SCAN_WORKER_PORT=<worker-port> pnpm --filter @refresh/scan-worker dev`. Give `apps/web` the same tokens, the worker URL, and the database (`SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> SCAN_WORKER_URL=http://127.0.0.1:<worker-port> DATABASE_URL=<url>`, or set them in `apps/web/.env.local`); both tokens must be at least 32 characters and different from each other (`openssl rand -hex 32`). The web app needs PostgreSQL: start the local one with `pnpm db:up` (port `5432`) and apply migrations with `DATABASE_URL=postgresql://refresh:refresh@127.0.0.1:5432/refresh pnpm db:migrate`; stop it with `pnpm db:down` when done. The E2E suite (`pnpm test:e2e`) starts its own Testcontainers Postgres, fixture server, worker, and web app on ports `3090–3093` (override with `E2E_WEB_PORT`, `E2E_WORKER_PORT`, `E2E_FIXTURES_PORT`, `E2E_CLOSED_PORT`), so stop anything on those ports first. Use a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, pick another one within the range. Configure the URLs between services, record the ports and processes started, and bring up only the services that are needed.
   **Done when:** the approach is clear, `AGENTS.md` and all rules have been consulted, the applicable skills are loaded, and the required services are available.

3. **Implement** — implement each subtask in order; at the end, run the task's validations and tests using the commands defined in `AGENTS.md` and the applicable rules.
   **Done when:** every subtask is implemented and the task's applicable validations and tests pass.

4. **Finish and clean up** — mark all subtasks and applicable tests as completed (`[x]`) in the `task_[num].md` file. Then mark the task as completed (`[x]`) in `tasks.md`, report in one line what was implemented, and shut down every service started by this run. Stop the processes gracefully, confirm the ports were released, and do not stop processes belonging to another worktree or to the user. Do this cleanup even if the run is interrupted or blocked.
   **Done when:** all subtasks and applicable tests are marked in the task file, and the task is marked as completed in `tasks.md`.
