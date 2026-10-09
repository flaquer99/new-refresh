# Folder Structure

pnpm + Turborepo monorepo. Workspaces: `apps/*` and `packages/*`. Package names are scoped `@refresh/*`.

## Tree

```
.
├── AGENTS.md                  # agent entrypoint (rules, skills, commands)
├── package.json               # root scripts, all delegate to turbo
├── pnpm-workspace.yaml        # workspaces + shared dependency catalog
├── turbo.json                 # task graph (build, dev, lint, test, test:e2e, ...)
├── docker-compose.yml         # local dev Postgres 17 only (pnpm db:up / db:down)
├── .claude/
│   ├── rules/                 # always-read project rules
│   └── skills/                # on-demand skills (e.g. react-rules)
├── apps/
│   ├── web/                   # @refresh/web — Next.js frontend, scan persistence owner, /api/scans proxy
│   │   ├── src/app/           # App Router: layout.tsx, page.tsx (form), scans/ (history, [id] scan link, actions.ts), api/scans/ and api/internal/scans/ Route Handlers
│   │   ├── src/components/    # layout/ (header), scan/ (form, live scan, failure), report/, history/ components
│   │   ├── src/hooks/         # one hook per file (use-scan, use-scan-polling, ...)
│   │   ├── src/lib/           # client-side helpers (scan API wrappers, report filtering/grouping, cn)
│   │   ├── src/server/        # server-only code: db/ (scan store singleton), scans/ (start, status, callback, delete, worker client), log/
│   │   ├── src/testing/       # Vitest helpers and fixtures (excluded from coverage)
│   │   ├── e2e/               # Playwright specs; e2e/support/ holds page objects, helpers, the web servers list, and the Testcontainers database launcher
│   │   ├── public/            # static assets
│   │   ├── next.config.ts
│   │   ├── playwright.config.ts # starts database, fixtures, worker, and web for the E2E suite
│   │   ├── vitest.config.ts
│   │   ├── tsconfig.json
│   │   ├── .env.example       # SCAN_WORKER_URL, SCAN_WORKER_TOKEN, SCAN_CALLBACK_TOKEN, DATABASE_URL (copy to .env.local)
│   │   ├── biome.json         # extends @refresh/config/biome/next
│   │   └── AGENTS.md          # Next.js-specific agent rules
│   └── scan-worker/           # @refresh/scan-worker — Fastify HTTP service (127.0.0.1:3001) + Playwright/axe scanner
│       ├── src/index.ts       # bootstrap: config, egress guard, Chromium, Fastify, graceful shutdown
│       ├── src/config.ts      # env parsing (SCAN_WORKER_*, SCAN_EGRESS_ALLOWLIST, LOG_LEVEL)
│       ├── src/bootstrap/     # start/stop the worker services, signal handling
│       ├── src/server/        # Fastify app, auth hook, routes (scans, health)
│       ├── src/scans/         # scan registry, runner, limits, deadline
│       ├── src/callback/      # result notifier: posts each final ScanResult to web, with retries
│       ├── src/crawl/         # crawl frontier, URL normalization, link extraction, robots.txt
│       ├── src/audit/         # page loading, axe runner, manual probes
│       ├── src/network/       # IP policy, DNS, target validation, egress guard, guarded fetch
│       ├── src/browser/       # guarded Chromium launch and supervisor
│       ├── src/wcag/          # WCAG 2.2 A/AA catalog and manual checks
│       ├── src/report/        # axe → contract mapping, report and summary builders
│       ├── src/testing/       # Vitest helpers (excluded from coverage)
│       ├── vitest.config.ts   # extends @refresh/config/vitest/base, longer timeouts for Chromium suites
│       ├── tsconfig.json
│       ├── tsconfig.build.json # build-only config (excludes tests and src/testing/)
│       ├── .env.example       # SCAN_WORKER_TOKEN, SCAN_CALLBACK_URL/TOKEN, SCAN_WORKER_HOST/PORT, SCAN_EGRESS_ALLOWLIST, LOG_LEVEL
│       └── biome.json         # extends @refresh/config/biome/base
└── packages/
    ├── config/                # @refresh/config — shared tooling config only
    │   ├── biome.base.json    # exported as @refresh/config/biome/base
    │   ├── biome.next.json    # exported as @refresh/config/biome/next
    │   └── vitest/base.mjs    # exported as @refresh/config/vitest/base (80% coverage floor)
    ├── scan-contracts/        # @refresh/scan-contracts — zod schemas, types, limits shared by web and worker (compiled to dist/)
    ├── db/                    # @refresh/db — Prisma 7 schema + migrations (prisma/), scan store (src/), Testcontainers test helpers (src/testing/); generated client in src/generated/ (gitignored)
    └── a11y-fixtures/         # @refresh/a11y-fixtures — fixture sites (sites/) + serveFixtures() for tests only
```

## Where things go

| Kind of code | Location |
| --- | --- |
| Pages, layouts, routes, Route Handlers | `apps/web/src/app/` |
| React components / hooks / client helpers | `apps/web/src/components/`, `apps/web/src/hooks/`, `apps/web/src/lib/` |
| Server-only web code (scan store access, worker client, callback) | `apps/web/src/server/` |
| Database schema, migrations, data access (scan store) | `packages/db/` (`@refresh/db`); the web app uses it only from `src/server/` |
| E2E tests (Playwright) | `apps/web/e2e/` (helpers in `apps/web/e2e/support/`) |
| Static files served as-is | `apps/web/public/` |
| Worker logic (HTTP API, crawling, scanning, browser automation) | `apps/scan-worker/src/` |
| Unit / integration tests | next to the code as `*.test.ts(x)`; shared test helpers in `src/testing/` |
| Scan API contracts (schemas, types, limits) | `packages/scan-contracts/` (`@refresh/scan-contracts`) |
| Accessibility fixture sites for tests | `packages/a11y-fixtures/sites/` (`@refresh/a11y-fixtures`) |
| Shared lint/format/test config | `packages/config/` |
| Code shared by several workspaces | new package under `packages/<name>/` (`@refresh/<name>`) |
| Project rules / skills for agents | `.claude/rules/` / `.claude/skills/` |
| SDD feature artifacts (PRD, TechSpec, tasks, review, QA) | `tasks/prd-[slug]/` |

## Conventions

- Apps never import from each other. Share code through a `packages/*` workspace.
- Reference internal packages as `"@refresh/<name>": "workspace:*"`.
- Shared dev tool versions (`@biomejs/biome`, `ultracite`) come from the `catalog:` in `pnpm-workspace.yaml`.
- Shared test tool versions (`vitest`, `@vitest/coverage-v8`, `@playwright/test`), the worker's `playwright` runtime (kept on the same version), and `zod` also come from the catalog.
- `apps/web` reaches the worker only over HTTP (`SCAN_WORKER_URL`); it never imports worker code.
- Only `apps/web` talks to the database, through `@refresh/db`; the worker stores nothing and reports results to web over HTTP (`SCAN_CALLBACK_URL`).
- Generated or local-only folders are not source: `node_modules/`, `.next/`, `.turbo/`, `dist/`, `coverage/`, `test-results/`, `playwright-report/`, `packages/db/src/generated/`.
