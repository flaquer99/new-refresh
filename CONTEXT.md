# Accessibility Scan

`refresh` checks a website against WCAG 2.2 Level A and AA and tells the user what is wrong, where, and how to fix it. Decisions behind it: [ADR-0001](./docs/adr/0001-wcag-accessibility-scan.md), [ADR-0002](./docs/adr/0002-persist-scans-in-web-owned-postgres.md).

## Language

### Scanning

**Scan**:
One run of the checker, started from a single submitted URL and a crawl depth, producing one report. Scans are anonymous: no one owns a scan, and every scan is visible to everyone through the scan history.
_Avoid_: Audit, job, test run

**Scan link**:
The permanent, unguessable address of one scan. Opening it shows the scan's progress or its report, including after a reload.
_Avoid_: Share link, permalink, report URL

**Scan history**:
The list of all scans, newest first, open to every visitor. Each entry leads to its scan link. Any visitor can delete a scan that is no longer running, which removes it and its report for good.
_Avoid_: Dashboard, audit log, my scans

**Start URL**:
The URL the user submits. It is always scanned, regardless of `robots.txt`.
_Avoid_: Root URL, seed, target

**Origin**:
Scheme, host, and port of the start URL after redirects. Only pages on this origin belong to the scan.
_Avoid_: Site, domain

**Depth**:
How many link hops from the start URL the scan follows (0–3). Depth 0 means the start URL only.
_Avoid_: Level (reserved for WCAG levels)

**Viewport**:
One of the two widths every page is checked at: desktop (1280 px) or mobile (320 px).
_Avoid_: Breakpoint, device

**Scan outcome**:
How a finished scan ended: complete, cancelled by the user, page limit reached, or time limit reached. Every outcome except complete yields a partial report. A scan that cannot reach its start URL, or that is cut short by the checker restarting (interrupted), fails and has no report.
_Avoid_: Result, state

### Findings

**Success criterion**:
A numbered WCAG 2.2 requirement, such as "1.4.3 Contrast (Minimum)", with its level (A or AA). Every finding points to at least one.
_Avoid_: Rule, guideline, check

**Violation**:
An automatically confirmed failure of a success criterion on a specific element, with exactly one severity.
_Avoid_: Issue, error, bug

**Severity**:
How much a violation harms users: critical, serious, moderate, or minor.
_Avoid_: Priority, impact (as a user-facing term)

**Review item**:
An element whose automated check was inconclusive, so a person must decide whether it fails.
_Avoid_: Warning, incomplete

**Manual check**:
A success criterion that applies to the scanned content but can only be judged by a person, with guidance on what to check. Scoped to a page or to the whole site.
_Avoid_: TODO, recommendation

**Needs review**:
The user-facing umbrella for review items and manual checks together. Never a violation.
_Avoid_: Potential issue

### Report

**Report**:
The deliverable of a scan: summary, violations, needs-review items, coverage, and the disclaimer. Stored with its scan and reachable through the scan link.
_Avoid_: Results page, audit

**Page result**:
What happened to one page the scan found: scanned, skipped (with a reason such as robots.txt or not HTML), or failed (with a reason such as HTTP error or timeout).
_Avoid_: Page status

**Coverage**:
The list of page results, showing what the scan did and did not check.
_Avoid_: Sitemap, crawl log
