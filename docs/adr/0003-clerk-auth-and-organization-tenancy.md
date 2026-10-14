---
status: accepted
date: 2026-10-14
---

# Authenticate with Clerk and scope every scan to a single organization

Scans were anonymous and public (ADR-0002): anyone with the URL could start a scan, read any report, browse the whole history, and delete any finished scan. That blocks using `refresh` with real clients, whose scans reveal weaknesses in their sites. We decided to add authentication and multi-tenancy through Clerk. Every scan belongs to one Clerk organization, a person belongs to at most one organization, and `apps/web` enforces the boundary on the server. This supersedes the parts of ADR-0002 that say history is open to every visitor and that any visitor can delete any finished scan. Requirements: [`tasks/prd-clerk-auth-organizations/prd.md`](../../tasks/prd-clerk-auth-organizations/prd.md); design: [`techspec.md`](../../tasks/prd-clerk-auth-organizations/techspec.md).

## Decisions

**1. Clerk is the identity provider and owns all personal data.** Users, organizations, memberships, roles, invitations, and sessions live in Clerk (`@clerk/nextjs` 7). The database stores only Clerk identifiers plus a display-name snapshot of the starter. Auth, account, organization, and onboarding pages are Clerk's prebuilt components (`SignIn`, `SignUp`, `UserProfile`, `OrganizationProfile`, `TaskChooseOrganization`) themed with the `@clerk/ui` shadcn theme inside the existing app shell, so they follow the HUD look and the light/dark/system setting.

**2. Two roles, scoped by organization.** `org:admin` manages members and organization info and can cancel or delete any scan of the organization; `org:member` can use the app and cancel or delete only the scans they started. The last admin cannot be demoted, removed, or leave.

**3. Authorization lives at each entry point, not in the proxy.** `src/proxy.ts` only runs `clerkMiddleware()`, because Clerk deprecated route matchers in the proxy. A `server/auth/` module resolves a `ScanActor` (`userId`, `organizationId`, `role`) from `await auth()` (networkless JWT verification). Pages use `requirePageActor()` (redirect to sign-in or onboarding), Route Handlers and Server Actions use `requireApiActor()` (`401 UNAUTHORIZED` or `403 ORGANIZATION_REQUIRED`). A pure `canManageScan(actor, scan)` implements "admin any, member own", and the UI hides controls the server would refuse anyway.

**4. Isolation is enforced in SQL.** `scans` gains `organization_id`, `started_by_user_id` (both required), and `started_by_name` (nullable, never rewritten after a rename). The scan store's `get`, `list`, and `deleteFinished` take the organization, so a scan of another organization answers "not found" exactly like a missing one and reveals nothing. System paths that run without a user (worker callback, stale-scan settling, discard) stay keyed by scan id. A new index `(organization_id, started_at DESC, id DESC)` serves scoped keyset paging and replaces the old `(started_at, id)` index.

**5. Legacy scans are deleted.** The migration `20261014000000_scan_ownership` runs `DELETE FROM scans` before adding the required columns. Existing scans are not migrated into an organization.

**6. One organization per person, enforced in three layers.** Clerk has no native limit on memberships, so: (a) the Clerk instance runs with Membership required (no personal workspaces) and an organization creation limit of 1; (b) an app-owned invite Server Action (`inviteMemberAction`) refuses invitees who already belong to an organization (`ALREADY_IN_ORGANIZATION`, `409`); (c) a Svix-signed webhook (`POST /api/webhooks/clerk`) on `organizationMembership.created` removes any extra membership as a backstop. The same webhook purges an organization's scans on `organization.deleted`.

**7. The worker stays unaware of users.** The callback route `/api/internal/scans/:id/result` keeps its own bearer token and no session. The worker's per-client concurrency limit is now keyed on the Clerk user id (`x-client-id`), replacing the old derived client id.

**8. Starter identity is captured once.** `resolveStarterName()` makes a single `currentUser()` call when a scan starts and stores the full name (or primary email). If Clerk is unreachable the name is `null` and the UI shows "Unknown member"; the scan still starts. History entries drop `startedByUserId` before reaching the browser and expose only `startedByName` and a server-computed `canDelete`.

**9. The E2E suite runs against a real Clerk development instance.** A `clerk-setup` Playwright project creates one admin, one member, and their organization through the Backend API (`+clerk_test` emails, fixed verification code) and a teardown project deletes them. Webhook behavior is covered by unit tests.

## Considered options

- **Authorization in `proxy.ts` route matchers:** deprecated by Clerk, and a matcher cannot express "this scan belongs to your organization". Checks beside each entry point are explicit and testable.
- **Self-hosted auth (Auth.js, Better Auth) with our own organization tables:** we would build and secure invitations, email verification, password reset, session management, and member management ourselves. Clerk ships all of it, including accessible prebuilt UI.
- **Multiple organizations per user with a switcher, or personal workspaces:** more product surface and a leakier isolation story; out of scope for now. Single membership keeps the active organization unambiguous.
- **Only Clerk's creation limit for single membership:** it does not stop accepting an invitation to a second organization, hence the invite check and the webhook backstop.
- **Filtering by organization in the page or route layer only:** a forgotten filter leaks data. Scoping the store methods makes the safe call the only call.
- **Storing the user's name by reference (resolve from Clerk on every read):** an extra Clerk round trip per history row and failure mode on every page. A snapshot is cheap and degrades to "Unknown member".
- **Migrating legacy scans to a default organization:** no organization exists to own them, and they were public by design. Deleting is simpler and was accepted.

## Consequences

- Scan data is private to an organization. Signed-out visitors see a landing view at `/` and are redirected to sign-in on scan pages (`401` on the API).
- Clerk becomes a runtime dependency and a vendor lock-in point: sign-in, org management, and the Backend API calls in invitations and the webhook need it reachable. Scan pages themselves only need local JWT verification.
- New configuration: Clerk keys and path variables, `CLERK_WEBHOOK_SIGNING_SECRET`, and E2E keys, all listed in `.env.example` and Turbo's `passThroughEnv`. The Clerk instance settings and the webhook endpoint (events `organizationMembership.created`, `organization.deleted`) must be applied in every environment; they are recorded in the README.
- Removing a member or leaving keeps the scans they started with the organization.
- A removed member loses access on their next request; an already-issued session token may still authorize until it expires.
- There is no organization deletion in the app and no audit log of member and role changes. Deleting an organization in the Clerk dashboard purges its scans through the webhook.
- If the webhook is not delivered, the one-organization backstop and the scan purge do not run until it is; the invite check still prevents the common path.
- The callback endpoint remains reachable wherever web is; a deployment should keep `/api/internal/*` off the public edge (unchanged from ADR-0002).
