import { fixtureUrl } from "./support/ports";
import { completeScanAs } from "./support/scan-as";
import { ScanHistoryPage } from "./support/scan-history-page";
import { notFoundHeading } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const HTTP_NOT_FOUND = 404;

test.describe("E2E-06 — another organization cannot see a scan", () => {
	test.use({ actor: "outsider" });

	test("answers not found on the scan link", async ({
		page,
		browser,
		baseURL,
		world,
	}) => {
		// GIVEN
		const scanId = await completeScanAs({
			browser,
			baseURL,
			user: world.admin,
			url: fixtureUrl("/clean/?other-org=1"),
		});

		// WHEN
		const response = await page.goto(`/scans/${scanId}`);

		// THEN
		expect(response?.status()).toBe(HTTP_NOT_FOUND);
		await expect(notFoundHeading(page)).toBeVisible();
	});

	test("lists nothing of the other organization in the history", async ({
		page,
		browser,
		baseURL,
		world,
	}) => {
		// GIVEN
		const scanId = await completeScanAs({
			browser,
			baseURL,
			user: world.admin,
			url: fixtureUrl("/clean/?other-org-history=1"),
		});

		// WHEN
		const history = new ScanHistoryPage(page);
		await history.open();

		// THEN
		await expect(history.entry(scanId)).toHaveCount(0);
	});
});

test.describe("E2E-07 — a member's scan is shared with the admin", () => {
	test("shows the scan in the admin history with the starter name", async ({
		page,
		browser,
		baseURL,
		world,
	}) => {
		// GIVEN
		const scanId = await completeScanAs({
			browser,
			baseURL,
			user: world.member,
			url: fixtureUrl("/clean/?shared=1"),
		});

		// WHEN
		const history = new ScanHistoryPage(page);
		await history.open();

		// THEN
		await expect(history.entry(scanId)).toContainText(world.member.fullName);
	});
});
