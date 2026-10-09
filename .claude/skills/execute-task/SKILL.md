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
   When the task requires running the application, prepare an isolated environment for the worktree: use an available port in the `30**` range (for example, `3000–3099`) for `apps/web`, started with `pnpm --filter @refresh/web dev --port <port>` (Next.js serves both the UI and the API routes, so it is the only HTTP service). `apps/scan-worker` is a plain Node process with no port; start it with `pnpm --filter @refresh/scan-worker dev` only when the scope involves scanning. Use a dedicated range for each additional database or service. Check each port before starting the process; if it is taken, pick another one within the range. Configure the URLs between services, record the ports and processes started, and bring up only the services that are needed.
   **Done when:** the approach is clear, `AGENTS.md` and all rules have been consulted, the applicable skills are loaded, and the required services are available.

3. **Implement** — implement each subtask in order; at the end, run the task's validations and tests using the commands defined in `AGENTS.md` and the applicable rules.
   **Done when:** every subtask is implemented and the task's applicable validations and tests pass.

4. **Finish and clean up** — mark all subtasks and applicable tests as completed (`[x]`) in the `task_[num].md` file. Then mark the task as completed (`[x]`) in `tasks.md`, report in one line what was implemented, and shut down every service started by this run. Stop the processes gracefully, confirm the ports were released, and do not stop processes belonging to another worktree or to the user. Do this cleanup even if the run is interrupted or blocked.
   **Done when:** all subtasks and applicable tests are marked in the task file, and the task is marked as completed in `tasks.md`.
