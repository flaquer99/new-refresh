# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a developer or QA engineer who needs to find and fix WCAG 2.2 A/AA issues on a site before release. They want precise locations (page, CSS selector, HTML snippet, viewport), the success criterion broken, and a fix they can act on.

Secondary (served, not designed around): designers, content owners, and consultants or sales people running a quick audit of a prospect's site. They rely on plain-language explanations and clear priorities.

Accounts and organizations. Every user signs in and belongs to exactly one organization (a team). Organization admins invite people and manage members and roles; members start scans and manage their own. Scans and history are private to the organization: nobody outside it can open a scan link, see the history, or learn that a scan exists.

- Roles: `admin` (creates the organization, invites and removes members, changes roles, edits organization details, cancels and deletes any scan of the organization) and `member` (starts scans, cancels and deletes only the scans they started, sees the organization's scans and members).
- A person belongs to one organization at a time.

## Product Purpose

`refresh` turns one URL into a site-wide WCAG 2.2 Level A/AA report. It crawls same-origin pages, audits each one at desktop (1280 px) and mobile (320 px) with axe-core in a real browser, maps every finding to a success criterion, and explains how to fix it. Criteria that need human judgment are listed as "needs review" instead of being skipped.

Today it is an internal demo built by 99x to show clients and prospects that 99x builds quality, accessible product. Success means a demo that is credible end to end: fast, accurate, honest about its limits, and itself accessible.

## Positioning

Site-wide, zero setup. One URL, no browser extension, no configuration, and an account that takes a minute to create: refresh crawls up to 50 pages (depth 0–3) and audits every page at two viewports in a single run. Single-page tools such as axe DevTools, WAVE, and Lighthouse audit the page in front of you; refresh audits the site.

## Operating Context

- Flow: landing page for signed-out visitors (`/`, with Sign in and Sign up) → sign-up with name, email, and password, verified by an emailed code (`/sign-up`) or sign-in (`/sign-in`) → onboarding: create an organization or accept a pending invitation (`/onboarding`) → scan form (`/`, URL + depth 0–3, prefillable via `?url=&depth=` for "Run again") → live progress (pages scanned / discovered, current URL, cancel) → stored report or failure at a scan link (`/scans/[id]`, visible only to the organization) → organization history (`/scans`, paged, showing who started each scan, with delete).
- Account and organization: `/account` (name, email, phone, password, sessions), `/organization` (name, logo, slug, members, roles, invitations for admins), `/join` (landing for invitation emails).
- Signed-out deep links to a scan return to it after sign-in.
- Scans take seconds (single page) to up to ~10 minutes (full crawl). Users watch progress or come back later via the scan link.
- Reports are read by technical users while fixing code, often alongside DevTools and the W3C "Understanding" documents the report links to.
- Shown live in demos to 99x clients and prospects, sometimes scanning the prospect's own site.

## Capabilities and Constraints

- Standard: WCAG 2.2 Level A and AA only (55 criteria). No AAA, no 4.1.1 Parsing, no separate 2.0/2.1 reporting.
- Findings: "violation" (automatically confirmed, severity critical / serious / moderate / minor) or "needs review" (needs human judgment, with what to check). Each violation records criterion, level, severity, page, selector, snippet, viewport(s), fix guidance, and a W3C "Understanding" link.
- Report: summary first (URL, depth, pages scanned / skipped / failed, counts by severity and level, completion state: complete, partial/cancelled, or limited by the page cap), then violations (group by criterion or page; filter by severity, level, viewport), then needs-review items, then coverage (skipped and failed pages).
- A disclaimer that automated testing cannot prove conformance is always shown.
- Crawl limits: depth ≤ 3, ≤ 50 pages, same origin only, respects `robots.txt`, skips non-HTML, records HTTP failures.
- Security: never requests private, loopback, link-local, or metadata addresses (SSRF guard). One running scan per user.
- Scans and reports are stored in PostgreSQL, owned by an organization, and visible only to its members. Another organization's scan link answers "not found". Each scan records the organization, the Clerk user ID of whoever started it, and a name snapshot taken at the start.
- Personal data (names, emails, phone numbers, passwords, sessions) is managed by Clerk and is not copied into the refresh database, which holds only Clerk IDs and the starter's name snapshot. Scans of a removed member stay in the organization's history; deleting an organization purges its scans.
- The first release deleted all pre-existing public scans when ownership was introduced.
- UI copy is English only.
- Out of scope today: social sign-in, passkeys, SMS verification, multiple organizations per person, personal workspaces, public or shareable-outside-the-organization scan links, billing, exports (JSON/CSV/PDF), authenticated pages, cross-origin crawling, sitemaps, scheduled scans, scan comparison, CI or issue-tracker integration, automatic fixes, conformance certification.

## Brand Commitments

- Name: `refresh` (rendered "Refresh" in titles).
- Built by 99x; the product exists to reflect 99x's craft to clients.
- Voice: plain, precise, and honest. Never implies a site is "compliant" or "conformant"; always distinguishes confirmed violations from items that need a person.

## Evidence on Hand

- Fixture sites with seeded violations, a clean page, a crawl graph, `robots.txt`, a PDF, a 404, and a 60-page site: `packages/a11y-fixtures/sites/`.
- Requirements, tech spec, code review, and QA report with evidence: `tasks/prd-wcag-accessibility-scan/`; accounts and organizations: `tasks/prd-clerk-auth-organizations/`.
- No customer logos, testimonials, case studies, benchmarks, or pricing exist. Do not fabricate them.

## Product Principles

1. **The site, not the page.** Breadth from one URL with zero setup is the reason refresh exists; once signed in, never add friction in front of the first scan.
2. **Fix-ready over exhaustive.** Every finding must tell a developer where it is and what to change.
3. **Honest coverage.** Never let a clean automated result read as conformance; "needs review" is a first-class result.
4. **Practice what it preaches.** refresh's own UI is the most visible proof of 99x's quality in every demo.

## Accessibility & Inclusion

The app's own UI must meet WCAG 2.2 Level AA and pass its own scan with zero automated violations (dogfooded). Pages built with Clerk components (sign-in, sign-up, account, organization, onboarding) are held to the same bar. Fully keyboard operable with a visible focus indicator never obscured; labelled fields with errors announced and linked; progress announced through a polite live region without stealing focus; severity never conveyed by color alone; logical heading hierarchy; works from 320 px wide with no horizontal scroll; respects light and dark color schemes.
