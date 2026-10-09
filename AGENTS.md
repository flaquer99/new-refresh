<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->

# Project overview

`refresh` — pnpm + Turborepo monorepo (`pnpm@11.9.0`, Node `>=22`). Packages scoped `@refresh/*`.

## Folder structure

See `.claude/rules/folder-structure.md` for the full tree and where each kind of code lives.

## Apps

### `apps/web` (`@refresh/web`)
- **Role:** user-facing web app and owner of stored scans. Pages: `/` (scan form, prefillable with `?url=&depth=` for "Run again"), `/scans/[id]` (scan link: live progress, stored report, failure, or 404), `/scans` (public scan history with "Older scans" paging and delete). Components, hooks, and client helpers live in `src/components/`, `src/hooks/`, `src/lib/`. Server code in `src/server/`: the scan store singleton (`server/db/`, backed by `@refresh/db`), start/status/callback/delete logic and the worker client (`server/scans/`). Route Handlers: `/api/scans` (start, then status and cancel), `/api/internal/scans/[id]/result` (worker callback, own bearer token). Deleting a scan is a Server Action (`src/app/scans/actions.ts`).
- **Tech:** Next.js 16.4 (App Router, Turbopack), React 19.3, Tailwind CSS 4 (via `@tailwindcss/turbopack` loader configured in `next.config.ts`), TypeScript 5, zod. Tests: Vitest + Testing Library (`src/**/*.test.{ts,tsx}`; `*.db.test.ts` run in a `db` project against a Testcontainers Postgres), Playwright E2E (`e2e/`, `playwright.config.ts`).
- **Runs on:** `http://localhost:3000` (Next default; no custom port set). `pnpm --filter @refresh/web dev`.
- **Env (`apps/web/.env.example`; copy to `.env.local`):** `SCAN_WORKER_URL` (default `http://127.0.0.1:3001`), `SCAN_WORKER_TOKEN` (required, same value as the worker), `SCAN_CALLBACK_TOKEN` (required, ≥ 32 chars, different from the worker token, same value as the worker's), and `DATABASE_URL` (Postgres; `postgresql://refresh:refresh@127.0.0.1:5432/refresh` with `pnpm db:up`). All are read at request time; without `DATABASE_URL` scan routes answer `500 INTERNAL_ERROR`, and without `SCAN_CALLBACK_TOKEN` every worker callback is refused with `401`.
- **Warning:** this Next.js version has breaking changes vs. training data. Read `node_modules/next/dist/docs/` before writing code.

### `apps/scan-worker` (`@refresh/scan-worker`)
- **Role:** internal HTTP service that owns scans: crawls same-origin pages (BFS, max 50) in one shared Chromium, audits each page at desktop and mobile with axe-core, maps findings to WCAG 2.2 A/AA criteria, and keeps running scans in memory only. It stores nothing: when a scan ends (or the worker shuts down) it posts the final `ScanResult` once to web's callback route, retrying 5xx and network errors after 1, 2, and 4 s. Every outbound request goes through an in-process egress guard that blocks private and local addresses. Routes: `POST /scans` (body carries the web-generated `scanId`), `GET /scans/:id`, `DELETE /scans/:id` (bearer token required) and `GET /health`.
- **Tech:** Node ESM (`"type": "module"`), TypeScript 5, `tsx` runner, Fastify 5, Playwright 1.63 + `@axe-core/playwright`, zod. Compiled with `tsc`. Tests: Vitest (`src/**/*.test.ts`). Many suites launch real headless Chromium against `@refresh/a11y-fixtures` (the `audit/`, `browser/`, and `crawl/` browser tests and the `*.integration.test.ts` scan-runner suites), so install Chromium before `pnpm test`; `*.integration.test.ts` marks the full crawl-and-audit runs, not every Chromium test.
- **Runs on:** `http://127.0.0.1:3001` (port in the repo's `30**` range). It does not load `.env` files, so pass the env inline: `SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> pnpm --filter @refresh/scan-worker dev`.
- **Env (`apps/scan-worker/.env.example`):** `SCAN_WORKER_TOKEN` (required, ≥ 32 chars, e.g. `openssl rand -hex 32`), `SCAN_CALLBACK_TOKEN` (required, ≥ 32 chars, must differ from `SCAN_WORKER_TOKEN`), `SCAN_CALLBACK_URL` (default `http://127.0.0.1:3000/api/internal/scans`), `SCAN_WORKER_HOST` (default `127.0.0.1`), `SCAN_WORKER_PORT` (default `3001`), `SCAN_EGRESS_ALLOWLIST` (tests only, comma-separated `host:port`; startup fails if set with `NODE_ENV=production`), `LOG_LEVEL` (default `info`).
- **Playwright:** browsers may need install: `pnpm --filter @refresh/scan-worker exec playwright install chromium`.

## Packages

### `packages/config` (`@refresh/config`)
Shared Biome/Ultracite lint+format config, no runtime code. Exports `@refresh/config/biome/base` and `@refresh/config/biome/next`. Apps' `biome.json` extend these. Use `base` for Node/TS apps, `next` for the Next.js app. Also exports `@refresh/config/vitest/base` (shared Vitest include and the 80% coverage thresholds).

### `packages/scan-contracts` (`@refresh/scan-contracts`)
Zod schemas, inferred types, and shared limits for the scan API used by both apps (`./scan-request`, `./scan-status`, `./scan-result`, `./report`, `./findings`, `./page-result`, `./errors`, `./limits`; subpath exports, no barrel). Compiled with `tsc` to `dist/`; consumers depend on `^build`.

### `packages/db` (`@refresh/db`)
Prisma ORM 7.10 (pinned exactly; npm `latest` is the 8.0 RC) schema for the `scans` table on PostgreSQL 17, its migrations (`prisma/migrations/`), and the scan store (`./scan-store`, `./scan-store-types`) that `apps/web` uses; writes are guarded on `status` in SQL. `prisma.config.ts` reads `DATABASE_URL` (also from `packages/db/.env`). `build` runs `prisma generate` into `src/generated/` (gitignored) then `tsc`. `./testing/*` exports Testcontainers helpers (`test-database`, `seed-scans`) used by its own tests, the web `db` test project, and the E2E database server. Tests need a running Docker daemon.

### `packages/a11y-fixtures` (`@refresh/a11y-fixtures`)
Static HTML fixture sites with seeded WCAG violations, a clean page, a crawl graph, `robots.txt`, a PDF, a 404 route, and a generated 60-page site (`sites/`). Exports `./serve-fixtures` (`serveFixtures({ port })`), used by the worker integration tests and the web E2E suite. Test-only; never imported by app runtime code.

## Commands

Run from repo root unless noted. Package manager is **pnpm** (never npm/yarn).

| Task | Command |
| --- | --- |
| Install deps | `pnpm install` |
| Local database | `pnpm db:up` (Postgres 17 in `docker-compose.yml` on `127.0.0.1:5432`), then `DATABASE_URL=postgresql://refresh:refresh@127.0.0.1:5432/refresh pnpm db:migrate`; stop with `pnpm db:down` |
| New migration | edit `packages/db/prisma/schema.prisma`, then `pnpm --filter @refresh/db migrate:dev --name <name>` (needs `DATABASE_URL`) |
| Dev (all apps, TUI) | `SCAN_WORKER_TOKEN=<token> SCAN_CALLBACK_TOKEN=<callback-token> DATABASE_URL=<url> pnpm dev` (the worker refuses to start without both tokens; put the same values in `apps/web/.env.local`) |
| Dev single app | `pnpm --filter @refresh/web dev` / `pnpm --filter @refresh/scan-worker dev` |
| Build all | `pnpm build` (`turbo run build`; outputs `.next/**`, `dist/**`) |
| Build single | `pnpm --filter @refresh/web build` |
| Start prod build | `pnpm --filter @refresh/web start` / `pnpm --filter @refresh/scan-worker start` |
| Lint (Biome) | `pnpm lint` |
| Format | `pnpm format` |
| Type check | `pnpm check-types` |
| Ultracite check/fix (per app) | `pnpm --filter <app> check` / `fix` |
| Tests (unit + integration, with coverage) | `pnpm test` (`turbo run test`) / `pnpm --filter <pkg> test` |
| E2E (Playwright, Chromium) | `pnpm test:e2e` (`turbo run test:e2e`) / `pnpm --filter @refresh/web test:e2e` |

Notes:
- `apps/web`, `apps/scan-worker`, `packages/scan-contracts`, `packages/db`, and `packages/a11y-fixtures` each have a `test` script (`vitest run --coverage`) that fails below 80% lines/branches/functions/statements. Add one to any new workspace with code. Turbo caches `coverage/**` and runs `test` after `^build`.
- `pnpm test:e2e` runs `apps/web/playwright.config.ts`. Its `webServer` (`e2e/support/servers.ts`) starts four processes itself: a throwaway Testcontainers Postgres with migrations applied (`e2e/support/start-database.mts`, which prints `DATABASE_URL` for the other servers), the fixture server (`127.0.0.1:3092`), the worker (`127.0.0.1:3091`, with `SCAN_EGRESS_ALLOWLIST` limited to the fixture, web, and a closed `3093` port, calling back to the web app), and a production build of the web app (`next build && next start` on `127.0.0.1:3090`). Random worker and callback tokens are generated per run (`E2E_SCAN_WORKER_TOKEN`, `E2E_SCAN_CALLBACK_TOKEN` override them). Docker must be running. Override ports with `E2E_WEB_PORT`, `E2E_WORKER_PORT`, `E2E_FIXTURES_PORT`, `E2E_CLOSED_PORT` if they are taken. Chromium must be installed (see the scan-worker Playwright note). `pnpm test:e2e` builds the internal packages first (`^build`); when running `pnpm --filter @refresh/web test:e2e` directly, build them first with `pnpm --filter @refresh/a11y-fixtures --filter @refresh/scan-contracts --filter @refresh/db build`.
- Shared dev tool versions (`@biomejs/biome`, `ultracite`, `vitest`, `@vitest/coverage-v8`, `@playwright/test`, `playwright`, `zod`, `prisma`, `@prisma/client`, `@prisma/adapter-pg`, `testcontainers`, `@testcontainers/postgresql`) are pinned in the `catalog:` of `pnpm-workspace.yaml`; reference them as `"catalog:"`.
- `allowBuilds` in `pnpm-workspace.yaml` restricts which deps may run install scripts (only `esbuild` allowed; `prisma`, `@prisma/engines`, `ssh2`, `cpu-features`, `protobufjs` are listed as `false` so pnpm 11 installs without running them — the Prisma CLI downloads its schema engine on first use, which needs network access).
- `dev`, `start`, and `test` pass the scan env vars (including `DATABASE_URL` and the callback settings; `test` also passes `DOCKER_HOST` and `TESTCONTAINERS_*`) through Turbo's strict env mode (`passThroughEnv` in `turbo.json`); add new env vars there too.
- Lint/format tool is Biome via Ultracite, not ESLint/Prettier. Note `apps/web` uses tabs; `scan-worker` and root use 2 spaces in package.json — let `pnpm format` decide.

# Rules

Project rules live in `.claude/rules/`. Read the relevant file before writing or changing code. They take precedence over conflicting guidance elsewhere (including Ultracite/Biome defaults).

| File | Applies to |
| --- | --- |
| `.claude/rules/folder-structure.md` | repo layout, workspace roles, where new code goes |
| `.claude/rules/code-standards.md` | all `.ts` / `.tsx` code (e.g. no comments, naming, structure) |
| `.claude/rules/tests.md` | every automated test; all code must be covered by tests |

# Skills

Project skills live in `.claude/skills/`. They load on demand, only when the task matches.

| Skill | Load when |
| --- | --- |
| `react-rules` (`.claude/skills/react-rules/SKILL.md`) | writing, editing, or reviewing any `.tsx` file, React component, hook, or Tailwind styling (Next.js App Router + React 19 + Tailwind v4). Invoke it before touching React code. |

## Spec-driven development (SDD) flow

Features follow PRD → TechSpec → tasks → implementation → review → QA. All artifacts live in `tasks/prd-[slug]/` (`prd.md`, `techspec.md`, `tasks.md`, `task_[num].md`, `codereview.md`, `qa.md`, `evidences/`).

| Skill | Load when |
| --- | --- |
| `create-prd` (`.claude/skills/create-prd/SKILL.md`) | defining requirements and scope of a new feature. Outputs `prd.md`. |
| `create-techspec` (`.claude/skills/create-techspec/SKILL.md`) | designing the architecture of a feature that already has a PRD. Outputs `techspec.md`. |
| `create-tasks` (`.claude/skills/create-tasks/SKILL.md`) | breaking a feature with PRD + TechSpec into implementation tasks. Outputs `tasks.md` + `task_[num].md`. |
| `execute-task` (`.claude/skills/execute-task/SKILL.md`) | implementing the next incomplete task of a feature. |
| `execute-review` (`.claude/skills/execute-review/SKILL.md`) | reviewing a feature's code against rules, TechSpec, and tasks. Outputs `codereview.md`. |
| `execute-qa` (`.claude/skills/execute-qa/SKILL.md`) | validating an implemented feature against the PRD acceptance criteria. Outputs `qa.md`. |
