import { OrganizationPage } from "./support/organization-page";
import { fixtureUrl } from "./support/ports";
import { ScanHistoryPage } from "./support/scan-history-page";
import { ownerOf, removeScans, seedNewestScans } from "./support/seed-scans";
import { signInAs } from "./support/sign-in";
import { expect, test } from "./support/test";

test.use({ actor: "visitor" });

test.describe("E2E-11 — an admin promotes and removes a member", () => {
	test("shows the promoted member with the Admin role", async ({
		page,
		team,
	}) => {
		// GIVEN
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();
		await organization.openMembers();

		// WHEN
		await organization.changeRole(team.member.email, "Admin");

		// THEN
		await expect(organization.memberRow(team.member.email)).toContainText(
			"Admin",
		);
	});

	test("sends the removed member to onboarding and keeps their scans", async ({
		page,
		browser,
		baseURL,
		team,
	}) => {
		// GIVEN
		const url = fixtureUrl("/clean/?removed-member=1");
		const seeded = seedNewestScans(1, url, ownerOf(team.member));
		const context = await browser.newContext({ baseURL });
		const removed = await context.newPage();
		await signInAs(removed, team.member);
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();
		await organization.openMembers();

		// WHEN
		await organization.removeMember(team.member.email);

		// THEN
		await removed.goto("/");
		await expect(removed).toHaveURL(/\/onboarding/);
		const history = new ScanHistoryPage(page);
		await history.open();
		await expect(history.entriesFor(url)).toHaveCount(1);
		removeScans(seeded);
		await context.close();
	});
});

test.describe("E2E-13 — a member sees the list without admin controls", () => {
	test("hides invitations, role changes, and removal", async ({
		page,
		team,
	}) => {
		// GIVEN
		await signInAs(page, team.member);
		const organization = new OrganizationPage(page);

		// WHEN
		await organization.open();
		await organization.openMembers();

		// THEN
		await expect(organization.memberRow(team.admin.email)).toBeVisible();
		await expect(organization.inviteForm()).toHaveCount(0);
		await expect(
			page.getByRole("button", { name: /invite|actions/i }),
		).toHaveCount(0);
	});
});

test.describe("E2E-14 — the last admin cannot leave", () => {
	test("refuses leaving the organization with a message", async ({
		page,
		team,
	}) => {
		// GIVEN
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();
		await organization.openGeneral();

		// WHEN
		await organization.leave();

		// THEN
		await expect(page.getByText(/last admin|only admin/i)).toBeVisible();
	});
});
