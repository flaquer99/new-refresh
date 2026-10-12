import { findWcagViolations } from "./support/axe";
import { fixtureUrl, WEB_ORIGIN } from "./support/ports";
import { expect, test } from "./support/test";

test.describe("E2E-11 — the app passes its own scan", () => {
	test("reports zero violations when the tool scans the app's form", async ({
		app,
	}) => {
		// WHEN
		await app.scanToReport({ url: `${WEB_ORIGIN}/` });

		// THEN
		await expect(app.report.coverageItem("Scanned", WEB_ORIGIN)).toHaveCount(1);
		await expect(app.report.summaryValue("Violations")).toHaveText("0");
	});

	test("has no WCAG A/AA violations in the progress view", async ({ app }) => {
		// GIVEN
		await app.submit({ url: fixtureUrl("/large/"), depth: 1 });
		await expect(app.progressHeading()).toBeVisible();

		// WHEN
		const violations = await findWcagViolations(app.page);

		// THEN
		expect(violations).toEqual([]);
		await app.cancelToReport();
	});

	test("has no WCAG A/AA violations in a report with findings", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: fixtureUrl("/report-mix/"), depth: 1 });

		// WHEN
		const violations = await findWcagViolations(app.page);

		// THEN
		expect(violations).toEqual([]);
	});

	test("has no WCAG A/AA violations in the start error", async ({ app }) => {
		// GIVEN
		await app.submit({ url: "http://localhost:8080/" });
		await expect(app.alert()).toBeVisible();

		// WHEN
		const violations = await findWcagViolations(app.page);

		// THEN
		expect(violations).toEqual([]);
	});
});
