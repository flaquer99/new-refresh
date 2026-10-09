import { findWcagViolations } from "./support/axe";
import { CLOSED_ORIGIN, fixtureUrl } from "./support/ports";
import { SCAN_TIMEOUT_MS } from "./support/scan-app";
import { ScanHistoryPage } from "./support/scan-history-page";
import { failureSection, notFoundHeading } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const MISSING_SCAN_ID = "00000000-0000-4000-8000-000000000000";

test.describe("E2E-12 — the persistence pages pass an accessibility check", () => {
	test("has no WCAG A/AA violations in the scan history", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: fixtureUrl("/clean/") });
		await new ScanHistoryPage(app.page).open();

		// WHEN
		const violations = await findWcagViolations(app.page);

		// THEN
		expect(violations).toEqual([]);
	});

	test("has no WCAG A/AA violations in an empty history page", async ({
		page,
	}) => {
		// GIVEN
		await new ScanHistoryPage(page).openPastTheEnd();
		await expect(page.getByText(/No scans yet/)).toBeVisible();

		// WHEN
		const violations = await findWcagViolations(page);

		// THEN
		expect(violations).toEqual([]);
	});

	test("has no WCAG A/AA violations in the delete confirmation", async ({
		app,
	}, testInfo) => {
		// GIVEN
		const url = fixtureUrl(`/clean/?axe=${testInfo.testId}`);
		await app.scanToReport({ url });
		const history = new ScanHistoryPage(app.page);
		await history.open();
		await history.deleteButton(url).click();
		await expect(history.dialog()).toBeVisible();

		// WHEN
		const violations = await findWcagViolations(app.page);

		// THEN
		expect(violations).toEqual([]);
	});

	test("has no WCAG A/AA violations on a failed scan's link", async ({
		app,
	}) => {
		// GIVEN
		await app.submit({ url: `${CLOSED_ORIGIN}/` });
		await expect(failureSection(app.page)).toBeVisible({
			timeout: SCAN_TIMEOUT_MS,
		});

		// WHEN
		const violations = await findWcagViolations(app.page);

		// THEN
		expect(violations).toEqual([]);
	});

	test("has no WCAG A/AA violations on the not-found page", async ({
		page,
	}) => {
		// GIVEN
		await page.goto(`/scans/${MISSING_SCAN_ID}`);
		await expect(notFoundHeading(page)).toBeVisible();

		// WHEN
		const violations = await findWcagViolations(page);

		// THEN
		expect(violations).toEqual([]);
	});
});
