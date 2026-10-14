import { AccountPage } from "./support/account-page";
import { SiteHeaderControls } from "./support/header";
import { signInAs } from "./support/sign-in";
import { expect, test } from "./support/test";

const NEW_FIRST_NAME = "Renamed";
const NEW_LAST_NAME = "Person";
const PHONE_NUMBER = "+15555550100";

test.describe("E2E-09 — a user manages their account", () => {
	test.use({ actor: "visitor" });

	test("shows the new name in the header menu after re-sign-in", async ({
		page,
		team,
	}) => {
		// GIVEN
		await signInAs(page, team.member);
		const account = new AccountPage(page);
		await account.open();

		// WHEN
		await account.changeName(NEW_FIRST_NAME, NEW_LAST_NAME);
		await page.context().clearCookies();
		await signInAs(page, team.member);

		// THEN
		const header = new SiteHeaderControls(page);
		await header.userButton().click();
		await expect(
			page.getByText(`${NEW_FIRST_NAME} ${NEW_LAST_NAME}`),
		).toBeVisible();
	});

	test("offers adding a phone number", async ({ page, team }) => {
		// GIVEN
		await signInAs(page, team.member);
		const account = new AccountPage(page);
		await account.open();

		// WHEN
		await account.addPhone(PHONE_NUMBER);

		// THEN
		await expect(page.getByText(PHONE_NUMBER)).toBeVisible();
	});
});
