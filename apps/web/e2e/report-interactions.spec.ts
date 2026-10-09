import { fixtureUrl } from "./support/ports";
import { definitionOf } from "./support/report-view";
import { expect, test } from "./support/test";

const REPORT_MIX_URL = fixtureUrl("/report-mix/");
const MISSING_ALT_URL = fixtureUrl("/missing-alt/");
const LOW_CONTRAST_URL = fixtureUrl("/low-contrast/");

test.describe("E2E-07 — a user groups and filters violations", () => {
	test("groups the violations by page", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: REPORT_MIX_URL, depth: 1 });

		// WHEN
		await app.report.choose("Group by", "Page");

		// THEN
		await expect(app.report.violationGroupHeadings()).toHaveText([
			`${MISSING_ALT_URL} (1)`,
			`${LOW_CONTRAST_URL} (1)`,
		]);
	});

	test("shows only serious violations when filtering by severity", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: REPORT_MIX_URL, depth: 1 });

		// WHEN
		await app.report.choose("Severity", "Serious");

		// THEN
		await expect(app.report.violationGroupHeadings()).toHaveText([
			"1.4.3 Contrast (Minimum) (1)",
		]);
	});

	test("updates the count to match the filter", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: REPORT_MIX_URL, depth: 1 });

		// WHEN
		await app.report.choose("Severity", "Serious");

		// THEN
		await expect(app.report.filterCount()).toHaveText(
			"Showing 1 of 2 violations",
		);
	});
});

test.describe("E2E-08 — a mobile-only issue is labelled with its viewport", () => {
	test("labels the target-size violation with the mobile viewport only", async ({
		app,
	}) => {
		// WHEN
		await app.scanToReport({ url: fixtureUrl("/small-targets/") });

		// THEN
		await expect(
			definitionOf(app.report.violation("2.5.8"), "Viewports"),
		).toHaveText("Mobile (320 px)");
	});
});
