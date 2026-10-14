# refresh

Accessibility scanner. Enter a URL, and refresh crawls same-origin pages, audits each one at desktop and mobile with axe-core, and reports WCAG 2.2 A/AA findings. Users sign in with Clerk and belong to one organization; scans and reports are stored in PostgreSQL and visible only to the organization that owns them.

| Part | What it does | Address |
| --- | --- | --- |
| `apps/web` | Next.js app: sign-in, organizations, scan form, live progress, reports, history. Owns the database. | http://localhost:3000 |
| `apps/scan-worker` | Fastify service that crawls and audits in headless Chromium, then posts each result back to web. Stores nothing. | http://127.0.0.1:3001 |
| PostgreSQL 17 | Stores scans and reports (Docker). | `127.0.0.1:5432` |

## Prerequisites

- Node.js 22.9 or newer
- pnpm 11.9.0 (`corepack enable` picks the version from `package.json`)
- Docker, running
- A Clerk account with a development instance (see [Clerk setup](#clerk-setup))

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

## Clerk setup

refresh uses [Clerk](https://clerk.com) for users, organizations, roles, and invitations. The app does not start without Clerk keys.

1. Install the Clerk CLI and sign in (interactive):

   ```bash
   pnpm add -g clerk
   clerk auth login
   ```

2. From `apps/web`, link the app and let the CLI write the keys into `apps/web/.env.local`:

   ```bash
   cd apps/web
   clerk init --app app_3KgbnbPKiObxapqOXT2WaeFUQRL
   clerk doctor
   ```

   Or copy the publishable and secret keys from the Clerk dashboard into `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Keep the path variables from `.env.example` as they are. Never commit keys.

3. Configure the Clerk instance (dashboard, or `clerk config patch`). A new environment must match this table:

   | Area | Setting |
   | --- | --- |
   | Organizations | Enabled. Membership required (no personal accounts). Creation limit per user: 1. Slugs enabled. Roles: `org:admin` (creator) and `org:member`. |
   | User and authentication | Email address required and verified by code. Password on. First and last name required. Phone number optional, not used for sign-in, no SMS verification. Social sign-in, passkeys, and magic links off. |
   | Paths (env) | `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`, `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`, both fallback redirect URLs `/`. |
   | Webhook endpoint | `POST {origin}/api/webhooks/clerk`, events `organizationMembership.created` and `organization.deleted`. |

4. Webhooks. The webhook removes a person's extra organization memberships (the one-organization rule) and purges the scans of a deleted organization. Deployed environments register the endpoint in the Clerk dashboard. Locally, forward events with:

   ```bash
   clerk webhooks listen
   ```

   Put the signing secret it prints (or the endpoint's secret from the dashboard) in `CLERK_WEBHOOK_SIGNING_SECRET`. Without the listener the webhook backstop is off; the invite form still enforces the rule.

### Migration warning

The `scan_ownership` migration runs `DELETE FROM scans` before it adds the required `organization_id` and `started_by_user_id` columns. Applying it deletes every existing scan. This is intentional: legacy scans have no owner.

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
| `apps/web/.env.local` | Next.js | `SCAN_WORKER_URL`, `SCAN_WORKER_TOKEN`, `SCAN_CALLBACK_TOKEN`, `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_*_URL`, `CLERK_WEBHOOK_SIGNING_SECRET` |
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
| End-to-end tests (starts its own database, fixtures, worker, and web; needs network and `E2E_CLERK_PUBLISHABLE_KEY` / `E2E_CLERK_SECRET_KEY` of a Clerk development instance) | `pnpm test:e2e` |
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
| The app fails at startup mentioning Clerk keys | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` or `CLERK_SECRET_KEY` is missing from `apps/web/.env.local`. |
| Webhook answers `400 INVALID_WEBHOOK` | `CLERK_WEBHOOK_SIGNING_SECRET` does not match the endpoint or the `clerk webhooks listen` session. |
| `pnpm test:e2e` stops with `E2E needs a Clerk development instance` | Set `E2E_CLERK_PUBLISHABLE_KEY` and `E2E_CLERK_SECRET_KEY`. |
| Port 5432 is taken | `POSTGRES_PORT=5433 pnpm db:up`, then change the port in both `DATABASE_URL` values. |

See `AGENTS.md` for the architecture, every command, and project rules.
