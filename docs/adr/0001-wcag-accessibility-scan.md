---
status: accepted
date: 2026-10-09
---

# WCAG 2.2 accessibility scan: separate in-memory scan worker behind a web proxy

`refresh` lets anyone submit a URL, crawls up to 50 same-origin pages (depth ≤ 3), checks each one at desktop and mobile width against WCAG 2.2 Level A and AA, and shows a report of violations and needs-review items (see [CONTEXT.md](../../CONTEXT.md) for the vocabulary). Scans are anonymous and reports are ephemeral: nothing is stored and there are no accounts. AAA criteria, exports, scan history, and authenticated pages are out of scope. We decided to run all crawling and auditing in a dedicated Fastify service (`apps/scan-worker`) that holds scan state in memory, and to have `apps/web` act only as a thin authenticated proxy that the browser polls. Because the scanner fetches URLs chosen by anonymous users, every outbound request it makes goes through an in-process egress guard.

## Decisions

**1. Separate worker with in-memory state, web as proxy.** The worker owns one shared Chromium, the scan registry, and the runner. `apps/web` Route Handlers validate input with the shared zod contracts and forward to the worker over HTTP with a shared bearer token (`SCAN_WORKER_TOKEN`, compared in constant time) and a client id. The browser polls `GET /api/scans/:id` every 2 s. Abuse limits: 2 active scans globally, 1 per client, 10 min per scan; finished scans are evicted after 10 min, and running scans no one has polled for 60 s are cancelled.

**2. In-process egress guard, not just a URL pre-check.** A loopback HTTP/CONNECT proxy resolves DNS itself, rejects any non-public address, and connects to the exact IP it vetted. Chromium (navigations, subresources, redirects) and `robots.txt` fetches all go through it. The submitted URL is also pre-checked so private hosts get an immediate `422`. A test-only allowlist (`SCAN_EGRESS_ALLOWLIST`) lets suites reach local fixtures; startup fails if it is set with `NODE_ENV=production`.

**3. axe-core for detection, local WCAG 2.2 catalog for reporting.** axe runs with WCAG A/AA tags plus `target-size`; its `incomplete` results become review items. Findings are mapped to a local catalog of all 55 A/AA success criteria (id, name, level, W3C Understanding link), and a manual-check catalog driven by DOM probes adds criteria that only a person can judge. axe's own `helpUrl` and criterion data are not used.

**4. Compiled shared contracts package.** `@refresh/scan-contracts` is built with `tsc` to `dist/` and consumed through subpath exports, rather than imported as TypeScript source, because the worker compiles with `rootDir: src` and rejects sources outside it. Turbo runs `^build` before `dev`, `build`, `check-types`, `test`, and `test:e2e`.

## Considered options

- **Queue (Redis/BullMQ) with persisted jobs:** rejected; adds infrastructure and persistence to a feature whose reports must not be stored.
- **Playwright inside Next.js Route Handlers:** rejected; breaks the rule that browser automation lives in the worker and is fragile on serverless runtimes.
- **Server-Sent Events instead of polling:** rejected; polling is simpler to proxy, needs no reconnect logic, is easy to test with fake timers, and 2 s is inside the 5 s progress goal.
- **SSRF protection by URL pre-check only:** misses redirects, subresources, and DNS rebinding. **Network-level firewalling only:** not present in dev and not testable. Both rejected as the sole defence.
- **Pa11y / HTML_CodeSniffer:** older rule set with weaker WCAG 2.2 coverage. **IBM Equal Access:** heavier, different result model. **Custom rules:** high cost and accuracy risk.
- **Crawlee:** too heavy for a 50-page breadth-first crawl. **`fastify-type-provider-zod`:** plain `safeParse` in handlers keeps dependencies down.

## Consequences

- The worker must run as a **single instance** (or behind sticky routing by scan id). A restart loses running scans; the UI shows them as failed.
- Per-client limits rely on a client id derived from request headers, which can be spoofed without a trusted proxy in front. The global cap bounds resource use regardless; revisit when choosing a deployment target.
- Automated checks cover only part of WCAG, so every report carries a disclaimer and lists needs-review items. A clean report is not a conformance claim.
- Pages within a scan are audited sequentially (desktop then mobile, 500 ms politeness delay) to keep load on target sites and worker memory predictable; throughput comes from concurrent scans, not concurrent pages.
- Open product questions at the time of this decision: whether site-scoped manual checks (2.1.4, 2.5.4) should appear on single-page scans, and whether pages that redirect off-origin should be listed in coverage with their own reason.
