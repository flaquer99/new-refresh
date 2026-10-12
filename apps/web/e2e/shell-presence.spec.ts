import { fixtureUrl } from "./support/ports";
import { ScanHistoryPage } from "./support/scan-history-page";
import { expect, test } from "./support/test";
import { openView, VIEW_NAMES } from "./support/views";

test.describe("E2E-01 — every view uses the new shell", () => {
	for (const view of VIEW_NAMES) {
		test(`renders the shell on ${view}`, async ({ app }) => {
			// GIVEN
			await openView(app, view);

			// THEN
			const { page } = app;
			await expect(
				page.getByRole("link", { name: "Skip to main content" }),
			).toHaveCount(1);
			await expect(page.getByRole("banner")).toBeVisible();
			await expect(page.getByRole("button", { name: /^Theme/ })).toBeVisible();
			await expect(page.locator("[data-hud-backdrop]")).toHaveCount(1);
			await expect(page.getByRole("main")).toHaveCount(1);

			if (view === "progress") {
				await app.cancelToReport();
			}
		});
	}

	test("renders the delete dialog over the shell", async ({ app }) => {
		// GIVEN
		await openView(app, "history");
		const history = new ScanHistoryPage(app.page);

		// WHEN
		await history.deleteButton(fixtureUrl("/clean/")).first().click();

		// THEN
		await expect(history.dialog()).toBeVisible();
		await expect(app.page.locator("[data-hud-backdrop]")).toHaveCount(1);
		await expect(app.page.locator("header")).toHaveCount(1);
	});
});
