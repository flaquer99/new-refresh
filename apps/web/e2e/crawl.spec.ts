import { fixtureUrl } from "./support/ports";
import { expect, test } from "./support/test";

const COVERAGE_URL = fixtureUrl("/page-coverage/");
const LARGE_SITE_URL = fixtureUrl("/large/");
const NOTHING_SCANNED = /^0 of \d+ discovered pages scanned/;

test.describe("E2E-05 — a user crawls a site and sees progress and coverage", () => {
	test("shows the scanned count growing while the crawl runs", async ({
		app,
	}) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 2 });
		await expect(app.progressStatus()).toContainText(NOTHING_SCANNED);

		// WHEN
		await app.waitForScannedPage();

		// THEN
		await expect(app.progressStatus()).toContainText("Now scanning: http://");
		await app.cancelToReport();
	});

	test("lists the robots.txt-disallowed page as skipped", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: COVERAGE_URL, depth: 2 });

		// THEN
		await expect(
			app.report.coverageItem("Skipped", fixtureUrl("/private/secret.html")),
		).toContainText("Disallowed by robots.txt");
	});

	test("lists the PDF as skipped because it is not HTML", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: COVERAGE_URL, depth: 2 });

		// THEN
		await expect(
			app.report.coverageItem(
				"Skipped",
				fixtureUrl("/page-coverage/brochure.pdf"),
			),
		).toContainText("Not an HTML page");
	});

	test("lists the missing page as failed with HTTP 404", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: COVERAGE_URL, depth: 2 });

		// THEN
		await expect(
			app.report.coverageItem(
				"Failed",
				fixtureUrl("/page-coverage/missing.html"),
			),
		).toContainText("HTTP 404 error");
	});

	test("still scans the other pages of the site", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: COVERAGE_URL, depth: 2 });

		// THEN
		await expect(
			app.report.coverageGroup("Scanned").getByRole("listitem"),
		).toHaveText([COVERAGE_URL, fixtureUrl("/page-coverage/about.html")]);
	});
});

test.describe("E2E-06 — a user cancels a running scan", () => {
	test("shows a partial report marked as cancelled", async ({ app }) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		await app.waitForScannedPage();

		// WHEN
		await app.cancelToReport();

		// THEN
		await expect(app.report.summaryValue("Result")).toHaveText(
			"Partial — cancelled",
		);
	});

	test("keeps the pages scanned before the cancel", async ({ app }) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		await app.waitForScannedPage();

		// WHEN
		await app.cancelToReport();

		// THEN
		await expect(
			app.report.coverageGroup("Scanned").getByRole("listitem").first(),
		).toHaveText(LARGE_SITE_URL);
	});
});
