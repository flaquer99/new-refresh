import { SignUpPage } from "./support/auth-pages";
import { deleteUserByEmail, findInvitationUrl } from "./support/clerk-cleanup";
import { testEmail } from "./support/clerk-users";
import {
	ONE_ORGANIZATION_TEXT,
	oneOrganizationNotice,
} from "./support/join-page";
import { OrganizationPage } from "./support/organization-page";
import { signInAs } from "./support/sign-in";
import { expect, test } from "./support/test";

test.use({ actor: "visitor" });

test.describe("E2E-10 — an admin invites a member through a link", () => {
	test("lists the invited person as a member after sign-up", async ({
		page,
		browser,
		baseURL,
		team,
	}) => {
		// GIVEN
		const email = testEmail("invitee");
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();
		await organization.invite(email);
		await expect(page.getByRole("status")).toContainText(email);
		const url = await findInvitationUrl(team.organization.id, email);

		// WHEN
		const context = await browser.newContext({ baseURL });
		const invitee = await context.newPage();
		await invitee.goto(url);
		await new SignUpPage(invitee).fillAndSubmit({
			firstName: "E2E",
			lastName: "Invitee",
			email,
		});
		await expect(invitee).toHaveURL(/\/$/);
		await context.close();

		// THEN
		await organization.open();
		await organization.openMembers();
		await expect(organization.memberRow(email)).toContainText("Member");
		await deleteUserByEmail(email);
	});
});

test.describe("E2E-15 — inviting someone who belongs elsewhere", () => {
	test("is refused with the one-organization message", async ({
		page,
		team,
		world,
	}) => {
		// GIVEN
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();

		// WHEN
		await organization.invite(world.outsider.email);

		// THEN
		await expect(organization.inviteFieldError()).toContainText(
			"already belongs to another organization",
		);
	});
});

test.describe("E2E-16 — a user with an organization opens an invitation", () => {
	test("sees the one-organization message and keeps the membership", async ({
		page,
		browser,
		baseURL,
		team,
		world,
	}) => {
		// GIVEN
		const email = testEmail("busy");
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();
		await organization.invite(email);
		const url = await findInvitationUrl(team.organization.id, email);
		const context = await browser.newContext({ baseURL });
		const busy = await context.newPage();
		await signInAs(busy, world.outsider);

		// WHEN
		await busy.goto(url);

		// THEN
		await expect(oneOrganizationNotice(busy)).toBeVisible();
		await expect(busy.getByText(ONE_ORGANIZATION_TEXT)).toBeVisible();
		await context.close();
	});
});
