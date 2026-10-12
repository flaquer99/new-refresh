---
status: accepted
date: 2026-10-09
---

# Persist scans in a web-owned Postgres; the worker reports results by callback

Reports used to be ephemeral (ADR-0001): a reload lost the scan. We now store every scan and its report so it survives reloads and appears in a public scan history (see [CONTEXT.md](../../CONTEXT.md)). We decided that `apps/web` owns a PostgreSQL database, accessed through Prisma ORM 7 behind a scan store in a new `@refresh/db` package, while `apps/scan-worker` stays free of storage: it runs a scan and calls web back once with the result. This supersedes the parts of ADR-0001 that say reports are never stored, that scan state lives only in worker memory, and that unwatched scans are cancelled.

## Decisions

**1. Web owns the database; the worker never persists.** The worker keeps a running scan in memory only while it runs. `apps/web` is the only consumer of `@refresh/db`, which exports a small scan store (create, record result, get, list, delete finished, mark interrupted) in terms of `@refresh/scan-contracts` types, so Prisma never leaks into the app.

**2. Web creates the scan id and row before the worker starts.** Web generates the UUID, inserts a `running` row, then calls `POST /scans` with that id. If the worker rejects the scan (limits, private host, unavailable), web deletes the row, so rejected attempts never reach the history. This rules out a fast failure calling back before the row exists.

**3. The worker calls back when a scan ends.** It posts the final status and report to `POST /api/internal/scans/:id/result` on web, at a URL fixed by worker config (`SCAN_CALLBACK_URL`, never per request) and authenticated with its own bearer token (`SCAN_CALLBACK_TOKEN`, separate from `SCAN_WORKER_TOKEN`, compared in constant time), retrying a few times. The store only writes a result to a row that is still `running`, so replays and late callbacks are no-ops. Browser polling remains only for live progress, and the 60 s abandon rule is removed: scans finish whether or not anyone is watching.

**4. Lost scans settle on read.** When a running scan's worker answers 404, web marks it failed as interrupted at once. Any row still `running` past the 10 min scan cap plus a 2 min grace is marked interrupted the next time history or its scan link reads it. No scheduler is needed.

**5. One `scans` table with the report as JSONB.** Columns hold what the history needs (start URL, depth, status, outcome, error code, timestamps, summary counts); the report is written once, read whole, stored with a report version, and validated with `ScanReportSchema` on read.

**6. Prisma ORM 7, Postgres via docker-compose for development, Testcontainers in tests.** `@refresh/db` integration tests and the E2E suite each start a throwaway Postgres container and apply migrations.

## Considered options

- **Worker owns the database** (web stays a pure proxy): rejected in favour of a worker that only executes scans and returns results.
- **Shared DB package read by web and written by the worker:** two apps coupled to one schema and its migrations.
- **Persist on browser poll:** a scan nobody watches would never be stored. **A Next.js background poller:** no guaranteed long-lived process. **Worker announces restarts:** fails if web is down at boot and assumes a single worker.
- **Worker-generated ids with an upserting callback:** ambiguous with deleted scans and races with the insert.
- **HMAC-signed callbacks:** the running-only write guard already makes replays harmless.
- **Normalized report tables:** around six tables and a migration per contract change, for queries nobody runs yet.
- **Prisma ORM 8:** a release candidate at the time (`8.0.0-rc.22`); chose the stable 7.10 line and accept a later upgrade.
- **PGlite or a shared compose database for tests:** not real Postgres, or not isolated per run.

## Consequences

- Every scanned start URL is visible to every visitor, and any visitor can permanently delete any scan that is no longer running. Acceptable for this test-phase product; accounts and tenants will scope both.
- Retention, accounts, evidence capture (screenshots) and object storage, and Docker images for the apps are out of scope; Docker is used only to run Postgres locally and in tests.
- If every callback attempt fails, a finished scan is recorded as interrupted and its report is lost.
- The callback endpoint is reachable wherever web is; a deployment should keep `/api/internal/*` off the public edge.
