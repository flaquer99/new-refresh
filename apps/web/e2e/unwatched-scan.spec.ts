import { fixtureUrl } from "./support/ports";
import { SCAN_TIMEOUT_MS, ScanApp } from "./support/scan-app";
import { waitForScanLink } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const COVERAGE_URL = fixtureUrl("/page-coverage/");
const LARGE_SITE_URL = fixtureUrl("/large/");

test.describe("E2E-04 — a scan finishes while nobody watches it", () => {
	test("shows the completed report when its link is reopened later", async ({
		app,
		context,
	}) => {
		// GIVEN
		await app.submit({ url: COVERAGE_URL, depth: 2 });
		const scanId = await waitForScanLink(app.page);
		await app.page.close();

		// WHEN
		const later = new ScanApp(await context.newPage());
		await later.page.goto(`/scans/${scanId}`);

		// THEN
		await expect(later.reportHeading()).toBeVisible({
			timeout: SCAN_TIMEOUT_MS,
		});
		await expect(later.report.summaryValue("Result")).toHaveText("Complete");
	});

	test("keeps every page the unwatched scan crawled", async ({
		app,
		context,
	}) => {
		// GIVEN
		await app.submit({ url: COVERAGE_URL, depth: 2 });
		const scanId = await waitForScanLink(app.page);
		await app.page.close();

		// WHEN
		const later = new ScanApp(await context.newPage());
		await later.page.goto(`/scans/${scanId}`);
		await expect(later.reportHeading()).toBeVisible({
			timeout: SCAN_TIMEOUT_MS,
		});

		// THEN
		await expect(
			later.report.coverageGroup("Scanned").getByRole("listitem"),
		).toHaveText([COVERAGE_URL, fixtureUrl("/page-coverage/about.html")]);
	});
});

test.describe("E2E-05 — a reloaded running scan keeps reporting progress", () => {
	test("shows live progress again after a reload", async ({ app }) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		await waitForScanLink(app.page);
		await app.waitForScannedPage();

		// WHEN
		await app.page.reload();

		// THEN
		await expect(app.progressHeading()).toBeVisible();
		await app.waitForScannedPage();
		await app.cancelToReport();
	});

	test("cancels from the reloaded link into a partial report", async ({
		app,
	}) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		await waitForScanLink(app.page);
		await app.waitForScannedPage();
		await app.page.reload();
		await app.waitForScannedPage();

		// WHEN
		await app.cancelToReport();

		// THEN
		await expect(app.report.summaryValue("Result")).toHaveText(
			"Partial — cancelled",
		);
	});
});
