import { fixtureUrl } from "./support/ports";
import { completeScanAs } from "./support/scan-as";
import { ScanHistoryPage } from "./support/scan-history-page";
import { signInAs } from "./support/sign-in";
import { expect, test } from "./support/test";

test.describe("E2E-08 — deleting another member's scan", () => {
	test.use({ actor: "visitor" });

	test("offers a member no delete control on the admin's scan", async ({
		page,
		browser,
		baseURL,
		team,
	}) => {
		// GIVEN
		const url = fixtureUrl("/clean/?admin-owned=1");
		await completeScanAs({ browser, baseURL, user: team.admin, url });
		await signInAs(page, team.member);

		// WHEN
		const history = new ScanHistoryPage(page);
		await history.open();

		// THEN
		await expect(history.entriesFor(url)).toHaveCount(1);
		await expect(history.deleteButton(url)).toHaveCount(0);
	});

	test("lets an admin delete a member's scan", async ({
		page,
		browser,
		baseURL,
		team,
	}) => {
		// GIVEN
		const url = fixtureUrl("/clean/?member-owned=1");
		const scanId = await completeScanAs({
			browser,
			baseURL,
			user: team.member,
			url,
		});
		await signInAs(page, team.admin);
		const history = new ScanHistoryPage(page);
		await history.open();

		// WHEN
		await history.deleteButton(url).click();
		await history.dialog().getByRole("button", { name: "Delete scan" }).click();

		// THEN
		await expect(history.entry(scanId)).toHaveCount(0);
	});
});
