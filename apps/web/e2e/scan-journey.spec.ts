import { fixtureUrl } from "./support/ports";
import { waitForScanLink } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const MISSING_ALT_URL = fixtureUrl("/missing-alt/");
const UNDERSTANDING_NON_TEXT =
	"https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html";

test.describe("E2E-01 — a user scans a single page and reads the report", () => {
	test("lands on the scan's own link with progress then the report", async ({
		app,
	}) => {
		// WHEN
		await app.submit({ url: MISSING_ALT_URL });
		const scanId = await waitForScanLink(app.page);

		// THEN
		await expect(app.reportHeading()).toBeVisible({ timeout: 60_000 });
		expect(app.page.url()).toContain(`/scans/${scanId}`);
	});

	test("lists the submitted page as the only scanned page", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: MISSING_ALT_URL });

		// THEN
		await expect(
			app.report.coverageGroup("Scanned").getByRole("listitem"),
		).toHaveText([MISSING_ALT_URL]);
	});

	test("shows the 1.1.1 violation with fix guidance", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: MISSING_ALT_URL });

		// THEN
		const violation = app.report.violation("1.1.1");
		await expect(violation).toContainText("1.1.1 Non-text Content");
		await expect(violation).toContainText("How to fix");
		await expect(violation).toContainText("#unlabelled-chart");
	});

	test("links the violation to the W3C Understanding document", async ({
		app,
	}) => {
		// WHEN
		await app.scanToReport({ url: MISSING_ALT_URL });

		// THEN
		const link = app.report.violation("1.1.1").getByRole("link", {
			name: "Understanding 1.1.1 Non-text Content (opens in a new tab)",
		});
		await expect(link).toHaveAttribute("href", UNDERSTANDING_NON_TEXT);
	});

	test("shows the disclaimer about automated testing", async ({ app }) => {
		// WHEN
		await app.scanToReport({ url: MISSING_ALT_URL });

		// THEN
		await expect(
			app.page.getByRole("note", { name: "About this report" }),
		).toContainText("Automated testing cannot prove WCAG conformance");
	});
});
