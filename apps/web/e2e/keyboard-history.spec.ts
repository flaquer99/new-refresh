import { tabTo } from "./support/keyboard";
import { fixtureUrl } from "./support/ports";
import { ScanHistoryPage } from "./support/scan-history-page";
import { waitForScanLink } from "./support/scan-link-page";
import { expect, test } from "./support/test";

test.describe("E2E-13 — the history works with the keyboard only", () => {
	test("reaches the history from the header and opens a scan", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: fixtureUrl("/clean/") });
		const scanId = await waitForScanLink(app.page);
		await app.page.goto("/");
		await tabTo(app.page, app.page.getByRole("link", { name: "Scan history" }));
		await app.page.keyboard.press("Enter");
		await expect(app.page).toHaveURL(/\/scans$/);

		// WHEN
		await tabTo(app.page, app.page.locator(`a[href="/scans/${scanId}"]`));
		await app.page.keyboard.press("Enter");

		// THEN
		await expect(app.reportHeading()).toBeVisible();
	});

	test("closes the delete confirmation with Escape and returns focus", async ({
		app,
	}, testInfo) => {
		// GIVEN
		const url = fixtureUrl(`/clean/?escape=${testInfo.testId}`);
		await app.scanToReport({ url });
		const history = new ScanHistoryPage(app.page);
		await history.open();
		await tabTo(app.page, history.deleteButton(url));
		await app.page.keyboard.press("Enter");
		await expect(
			history.dialog().getByRole("button", { name: "Cancel" }),
		).toBeFocused();

		// WHEN
		await app.page.keyboard.press("Escape");

		// THEN
		await expect(history.dialog()).toHaveCount(0);
		await expect(history.deleteButton(url)).toBeFocused();
	});

	test("deletes a scan with the keyboard and focuses the heading", async ({
		app,
	}, testInfo) => {
		// GIVEN
		const url = fixtureUrl(`/clean/?confirm=${testInfo.testId}`);
		await app.scanToReport({ url });
		const scanId = await waitForScanLink(app.page);
		const history = new ScanHistoryPage(app.page);
		await history.open();
		await tabTo(app.page, history.deleteButton(url));
		await app.page.keyboard.press("Enter");

		// WHEN
		await tabTo(
			app.page,
			history.dialog().getByRole("button", { name: "Delete scan" }),
		);
		await app.page.keyboard.press("Enter");

		// THEN
		await expect(history.entry(scanId)).toHaveCount(0);
		await expect(app.page.getByRole("heading", { level: 1 })).toBeFocused();
	});
});
