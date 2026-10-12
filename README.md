# refresh

Accessibility scanner. Enter a URL, and refresh crawls same-origin pages, audits each one at desktop and mobile with axe-core, and reports WCAG 2.2 A/AA findings. Scans and reports are stored in PostgreSQL and listed in a public history.

| Part | What it does | Address |
| --- | --- | --- |
| `apps/web` | Next.js app: scan form, live progress, reports, history. Owns the database. | http://localhost:3000 |
| `apps/scan-worker` | Fastify service that crawls and audits in headless Chromium, then posts each result back to web. Stores nothing. | http://127.0.0.1:3001 |
| PostgreSQL 17 | Stores scans and reports (Docker). | `127.0.0.1:5432` |

## Prerequisites

- Node.js 22.9 or newer
- pnpm 11.9.0 (`corepack enable` picks the version from `package.json`)
- Docker, running

## First-time setup

Run everything from the repository root.

1. Install dependencies and the Chromium build the worker uses:

   ```bash
   pnpm install
   pnpm --filter @refresh/scan-worker exec playwright install chromium
   ```

2. Create the env files from their examples:

   ```bash
   cp apps/web/.env.example apps/web/.env.local
   cp apps/scan-worker/.env.example apps/scan-worker/.env
   cp packages/db/.env.example packages/db/.env
   ```

3. Generate two different tokens, each at least 32 characters:

   ```bash
   openssl rand -hex 32   # SCAN_WORKER_TOKEN
   openssl rand -hex 32   # SCAN_CALLBACK_TOKEN
   ```

   Put both values in `apps/web/.env.local` and `apps/scan-worker/.env`. The two files must hold the same pair, and the two tokens must differ from each other. Leave `SCAN_EGRESS_ALLOWLIST` empty; it is for tests only.

4. Start PostgreSQL and apply the migrations:

   ```bash
   pnpm db:up
   pnpm db:migrate
   ```

   `pnpm db:migrate` reads `DATABASE_URL` from `packages/db/.env`.

## Run

```bash
pnpm db:up   # skip if the database is already running
pnpm dev
```

`pnpm dev` builds the internal packages, then starts web and the worker in the Turbo TUI. Open http://localhost:3000.

To run one app on its own:

```bash
pnpm --filter @refresh/web dev
pnpm --filter @refresh/scan-worker dev
```

Stop the apps with `Ctrl+C`. Stop the database with `pnpm db:down`; its data stays in a Docker volume until you remove it.

### Where each app reads its settings

| File | Read by | Keys |
| --- | --- | --- |
| `apps/web/.env.local` | Next.js | `SCAN_WORKER_URL`, `SCAN_WORKER_TOKEN`, `SCAN_CALLBACK_TOKEN`, `DATABASE_URL` |
| `apps/scan-worker/.env` | worker `dev` and `start` scripts | `SCAN_WORKER_TOKEN`, `SCAN_CALLBACK_TOKEN`, `SCAN_CALLBACK_URL`, `SCAN_WORKER_HOST`, `SCAN_WORKER_PORT`, `LOG_LEVEL` |
| `packages/db/.env` | Prisma CLI (`pnpm db:migrate`) | `DATABASE_URL` |

All `.env*` files except `.env.example` are gitignored. A variable set in the shell wins over the worker's `.env`.

## Production build

```bash
pnpm build
pnpm --filter @refresh/web start
pnpm --filter @refresh/scan-worker start
```

## Tests and checks

| Task | Command |
| --- | --- |
| Unit and integration tests (needs Docker and Chromium) | `pnpm test` |
| End-to-end tests (starts its own database, fixtures, worker, and web) | `pnpm test:e2e` |
| Lint | `pnpm lint` |
| Type check | `pnpm check-types` |
| Format | `pnpm format` |

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Worker exits with `Invalid worker config` | `apps/scan-worker/.env` is missing, lacks a token, or has a token shorter than 32 characters. |
| Worker exits with `SCAN_CALLBACK_TOKEN must differ from SCAN_WORKER_TOKEN` | Both tokens have the same value. Generate a second one. |
| Scan routes answer `500 INTERNAL_ERROR` | `DATABASE_URL` is missing from `apps/web/.env.local`, or the database is not running (`pnpm db:up`). |
| Scans never finish; the worker logs `401` on its callback | `SCAN_CALLBACK_TOKEN` differs between web and worker. |
| `SCAN_ALREADY_RUNNING` | The worker runs one scan at a time per client. Wait for it or cancel it. |
| Port 5432 is taken | `POSTGRES_PORT=5433 pnpm db:up`, then change the port in both `DATABASE_URL` values. |

See `AGENTS.md` for the architecture, every command, and project rules.
