import { uniqueSuffix } from "./support/clerk-users";
import { SiteHeaderControls } from "./support/header";
import { OrganizationPage } from "./support/organization-page";
import { signInAs } from "./support/sign-in";
import { expect, test } from "./support/test";

test.use({ actor: "visitor" });

test.describe("E2E-12 — an admin edits the organization", () => {
	test("updates the header with the new name and slug", async ({
		page,
		team,
	}) => {
		// GIVEN
		const name = `E2E Renamed ${uniqueSuffix()}`;
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();

		// WHEN
		await organization.updateProfile({ name, slug: `e2e-${uniqueSuffix()}` });

		// THEN
		await expect(
			new SiteHeaderControls(page).organizationBadge(name),
		).toBeVisible();
	});

	test("rejects a slug that another organization already uses", async ({
		page,
		team,
		world,
	}) => {
		// GIVEN
		await signInAs(page, team.admin);
		const organization = new OrganizationPage(page);
		await organization.open();

		// WHEN
		await organization.updateProfile({ slug: world.organization.slug });

		// THEN
		await expect(
			page.getByText(/slug.*(taken|already)|already.*taken/i),
		).toBeVisible();
	});
});
