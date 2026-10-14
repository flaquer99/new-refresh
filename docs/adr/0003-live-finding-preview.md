---
status: accepted
date: 2026-10-14
---

# Preview findings live in a sandboxed iframe fed by a worker-fetched HTML proxy

A report lists selectors and snippets but never shows where a problem sits on the page, and scans store no screenshots or DOM copies (see [prd.md](../../tasks/prd-scan-preview/prd.md)). We decided that each finding card can open an on-demand preview of the live page with the failing element highlighted. The page is fetched when the viewer opens the preview and nothing about it is stored.

## Decisions

**1. The worker fetches the raw HTML through its egress guard.** `POST /previews` on `apps/scan-worker` (bearer token required) fetches the stored finding's `pageUrl` with the same guarded fetch the scanner uses, so private, loopback, link-local, and metadata addresses are refused. The response is capped at 5 MB and 10 s, decoded with the header charset, and page-level failures come back as `200 unavailable` with a reason. The worker stays the only component that makes outbound requests from the server. It has no concurrency limit.

**2. Web rewrites the document.** `GET /api/scans/{id}/findings/{findingId}/preview` looks the finding up in the stored report (so only stored-finding URLs can be previewed, never arbitrary ones), asks the worker for the HTML, and rewrites it with `parse5`: it injects a `<base>`, a no-referrer policy, and the highlight runtime at the start of `<head>`, keeping the doctype so the page does not fall into quirks mode.

**3. The browser renders it in a sandboxed `srcdoc` iframe.** The frame uses `sandbox="allow-scripts"` (opaque origin, no forms, popups, top navigation, or modals) and `referrerpolicy="no-referrer"`. `srcdoc` needs one request, carries the unavailable reasons as JSON, and leaves no document URL that could be opened top-level. Page scripts run, so JS-heavy pages render.

**4. The highlight runtime is serialized from typed TypeScript functions.** The functions are turned into a script with `toString`, so the code stays typed, unit-tested, and covered without a bundling step. Each function is self-contained and receives its helpers as an object, which survives minification.

**5. The frame reports element status with `postMessage` and a token.** The runtime runs before any page script, captures `parent.postMessage`, and tags every message with a per-response random token. The report checks the token and `event.source`, so a page script cannot forge the status for another card.

**6. Viewport is a frame size, not a fetch parameter.** One HTML document serves both viewports and the page's media queries respond to the frame width. The client keeps the loaded document while a card's preview is open.

## Considered options

- **A worker-rendered DOM snapshot with scripts stripped:** safer and more deterministic, but rejected in favour of the proxy so JS-heavy pages render as the visitor would see them.
- **A direct cross-origin iframe:** blocked by `X-Frame-Options` and `frame-ancestors`, and the page cannot be scrolled or highlighted.
- **Scan-time screenshots:** out of scope; they need object storage and show nothing about the live page.

## Consequences

- Third-party JavaScript from the scanned page runs in the viewer's browser, with the viewer's network. The server-side SSRF guarantee covers everything refresh fetches; it does not extend to the embedded page.
- There is no rate limit or capacity limit in this version (accepted risk). Anyone can trigger repeated worker fetches of a stored finding's page, bounded by one fetch per request, 5 MB / 10 s, and stored-finding URLs only. Add a per-client limit before any public launch.
- Some pages break in an opaque origin or under `about:srcdoc` (storage access throws, client-side routers misread the path); client-only SPAs may show little and end as "element not found".
- The preview can differ from the scan (live content, consent banners), and cross-origin fonts may fall back.
- A future CSP on the refresh app must allow the inline `srcdoc` document and the inline runtime script.
