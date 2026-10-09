import { fixtureUrl } from "./support/ports";
import type { ScanApp } from "./support/scan-app";
import { ScanHistoryPage } from "./support/scan-history-page";
import { notFoundHeading, waitForScanLink } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const HTTP_NOT_FOUND = 404;

const scanAndOpenHistory = async (app: ScanApp, url: string) => {
	await app.scanToReport({ url });
	const scanId = await waitForScanLink(app.page);
	const history = new ScanHistoryPage(app.page);
	await history.open();
	return { scanId, history };
};

test.describe("E2E-09 — a user deletes a finished scan", () => {
	test("removes the scan from the history for good", async ({
		app,
	}, testInfo) => {
		// GIVEN
		const url = fixtureUrl(`/clean/?delete=${testInfo.testId}`);
		const { scanId, history } = await scanAndOpenHistory(app, url);
		await history.deleteButton(url).click();

		// WHEN
		await history.dialog().getByRole("button", { name: "Delete scan" }).click();

		// THEN
		await expect(history.entry(scanId)).toHaveCount(0);
		await app.page.reload();
		await expect(history.entry(scanId)).toHaveCount(0);
	});

	test("answers 404 Scan not found on the deleted scan's link", async ({
		app,
	}, testInfo) => {
		// GIVEN
		const url = fixtureUrl(`/clean/?delete=${testInfo.testId}`);
		const { scanId, history } = await scanAndOpenHistory(app, url);
		await history.deleteButton(url).click();
		await history.dialog().getByRole("button", { name: "Delete scan" }).click();
		await expect(history.entry(scanId)).toHaveCount(0);

		// WHEN
		const response = await app.page.goto(`/scans/${scanId}`);

		// THEN
		expect(response?.status()).toBe(HTTP_NOT_FOUND);
		await expect(notFoundHeading(app.page)).toBeVisible();
	});

	test("keeps the scan when the confirmation is cancelled", async ({
		app,
	}, testInfo) => {
		// GIVEN
		const url = fixtureUrl(`/clean/?keep=${testInfo.testId}`);
		const { scanId, history } = await scanAndOpenHistory(app, url);
		await history.deleteButton(url).click();

		// WHEN
		await history.dialog().getByRole("button", { name: "Cancel" }).click();

		// THEN
		await expect(history.deleteButton(url)).toBeFocused();
		await expect(history.entry(scanId)).toHaveCount(1);
	});
});
