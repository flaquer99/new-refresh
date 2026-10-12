import { fixtureUrl } from "./support/ports";
import { ScanHistoryPage } from "./support/scan-history-page";
import { waitForScanLink } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const MISSING_ALT_URL = fixtureUrl("/missing-alt/");
const LARGE_SITE_URL = fixtureUrl("/large/");

test.describe("E2E-08 — a history entry summarizes its scan", () => {
	test("shows the status and violation counts and opens the scan link", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: MISSING_ALT_URL });
		const scanId = await waitForScanLink(app.page);
		const history = new ScanHistoryPage(app.page);
		await history.open();
		const entry = history.entry(scanId);

		// WHEN
		await expect(entry).toContainText("Completed");
		await entry.getByRole("link", { name: MISSING_ALT_URL }).click();

		// THEN
		await expect(app.page).toHaveURL(new RegExp(`/scans/${scanId}$`));
		await expect(app.reportHeading()).toBeVisible();
	});

	test("lists the violation count of the report", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: MISSING_ALT_URL });
		const scanId = await waitForScanLink(app.page);
		const critical = await app.report.summaryValue("Critical").textContent();
		const history = new ScanHistoryPage(app.page);

		// WHEN
		await history.open();

		// THEN
		await expect(history.entry(scanId)).toContainText(`${critical} critical`);
	});
});

test.describe("E2E-10 — a running scan cannot be deleted", () => {
	test("offers no Delete action while the scan runs", async ({ app }) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		const scanId = await waitForScanLink(app.page);
		const history = new ScanHistoryPage(app.page);

		// WHEN
		await history.open();

		// THEN
		await expect(history.entry(scanId)).toContainText("Running");
		await expect(
			history.entry(scanId).getByRole("button", { name: /^Delete/ }),
		).toHaveCount(0);
		await app.page.goto(`/scans/${scanId}`);
		await app.cancelToReport();
	});
});
