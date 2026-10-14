# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a developer or QA engineer who needs to find and fix WCAG 2.2 A/AA issues on a site before release. They want precise locations (page, CSS selector, HTML snippet, viewport), the success criterion broken, and a fix they can act on.

Secondary (served, not designed around): designers, content owners, and consultants or sales people running a quick audit of a prospect's site. They rely on plain-language explanations and clear priorities.

No accounts. Anyone with the URL can start a scan, open a scan link, browse the public history, and delete scans.

## Product Purpose

`refresh` turns one URL into a site-wide WCAG 2.2 Level A/AA report. It crawls same-origin pages, audits each one at desktop (1280 px) and mobile (320 px) with axe-core in a real browser, maps every finding to a success criterion, and explains how to fix it. Criteria that need human judgment are listed as "needs review" instead of being skipped.

Today it is an internal demo built by 99x to show clients and prospects that 99x builds quality, accessible product. Success means a demo that is credible end to end: fast, accurate, honest about its limits, and itself accessible.

## Positioning

Site-wide, zero setup. One URL, no browser extension, no login, no configuration: refresh crawls up to 50 pages (depth 0–3) and audits every page at two viewports in a single run. Single-page tools such as axe DevTools, WAVE, and Lighthouse audit the page in front of you; refresh audits the site.

## Operating Context

- Flow: scan form (`/`, URL + depth 0–3, prefillable via `?url=&depth=` for "Run again") → live progress (pages scanned / discovered, current URL, cancel) → stored report or failure at a shareable scan link (`/scans/[id]`) → public history (`/scans`, paged, with delete).
- Scans take seconds (single page) to up to ~10 minutes (full crawl). Users watch progress or come back later via the scan link.
- Reports are read by technical users while fixing code, often alongside DevTools and the W3C "Understanding" documents the report links to.
- Shown live in demos to 99x clients and prospects, sometimes scanning the prospect's own site.

## Capabilities and Constraints

- Standard: WCAG 2.2 Level A and AA only (55 criteria). No AAA, no 4.1.1 Parsing, no separate 2.0/2.1 reporting.
- Findings: "violation" (automatically confirmed, severity critical / serious / moderate / minor) or "needs review" (needs human judgment, with what to check). Each violation records criterion, level, severity, page, selector, snippet, viewport(s), fix guidance, and a W3C "Understanding" link.
- Report: summary first (URL, depth, pages scanned / skipped / failed, counts by severity and level, completion state: complete, partial/cancelled, or limited by the page cap), then violations (group by criterion or page; filter by severity, level, viewport), then needs-review items, then coverage (skipped and failed pages).
- A disclaimer that automated testing cannot prove conformance is always shown.
- Crawl limits: depth ≤ 3, ≤ 50 pages, same origin only, respects `robots.txt`, skips non-HTML, records HTTP failures.
- Preview: each finding offers an on-demand live preview of its page in a sandboxed frame with the failing element highlighted (desktop and mobile widths); the page is fetched when opened and never stored.
- Security: never requests private, loopback, link-local, or metadata addresses (SSRF guard). Anonymous use of scans is rate-limited; previews are not (they are limited to stored-finding URLs; accepted risk for this version).
- Scans and reports are stored in PostgreSQL and listed publicly; no personal data is collected.
- UI copy is English only.
- Out of scope today: accounts, exports (JSON/CSV/PDF), authenticated pages, cross-origin crawling, sitemaps, scheduled scans, scan comparison, CI or issue-tracker integration, automatic fixes, conformance certification.

## Brand Commitments

- Name: `refresh` (rendered "Refresh" in titles).
- Built by 99x; the product exists to reflect 99x's craft to clients.
- Voice: plain, precise, and honest. Never implies a site is "compliant" or "conformant"; always distinguishes confirmed violations from items that need a person.

## Evidence on Hand

- Fixture sites with seeded violations, a clean page, a crawl graph, `robots.txt`, a PDF, a 404, and a 60-page site: `packages/a11y-fixtures/sites/`.
- Requirements, tech spec, code review, and QA report with evidence: `tasks/prd-wcag-accessibility-scan/`.
- No customer logos, testimonials, case studies, benchmarks, or pricing exist. Do not fabricate them.

## Product Principles

1. **The site, not the page.** Breadth from one URL with zero setup is the reason refresh exists; never add friction in front of the first scan.
2. **Fix-ready over exhaustive.** Every finding must tell a developer where it is and what to change.
3. **Honest coverage.** Never let a clean automated result read as conformance; "needs review" is a first-class result.
4. **Practice what it preaches.** refresh's own UI is the most visible proof of 99x's quality in every demo.

## Accessibility & Inclusion

The app's own UI must meet WCAG 2.2 Level AA and pass its own scan with zero automated violations (dogfooded). Fully keyboard operable with a visible focus indicator never obscured; labelled fields with errors announced and linked; progress announced through a polite live region without stealing focus; severity never conveyed by color alone; logical heading hierarchy; works from 320 px wide with no horizontal scroll; respects light and dark color schemes.
