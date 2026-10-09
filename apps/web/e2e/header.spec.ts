import type { Page } from "@playwright/test";
import { fixtureUrl } from "./support/ports";
import { waitForScanLink } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const currentLink = (page: Page) =>
	page
		.getByRole("navigation", { name: "Main" })
		.locator('[aria-current="page"]');

test.describe("E2E-11 — the header links the main destinations", () => {
	test("marks New scan as current on the form", async ({ app }) => {
		// THEN
		await expect(currentLink(app.page)).toHaveText("New scan");
	});

	test("marks Scan history as current on the history", async ({ app }) => {
		// WHEN
		await app.page
			.getByRole("navigation", { name: "Main" })
			.getByRole("link", { name: "Scan history" })
			.click();

		// THEN
		await expect(app.page).toHaveURL(/\/scans$/);
		await expect(currentLink(app.page)).toHaveText("Scan history");
	});

	test("shows both links without a current page on a scan link", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: fixtureUrl("/clean/") });
		await waitForScanLink(app.page);

		// WHEN
		const nav = app.page.getByRole("navigation", { name: "Main" });

		// THEN
		await expect(nav.getByRole("link")).toHaveText([
			"New scan",
			"Scan history",
		]);
		await expect(currentLink(app.page)).toHaveCount(0);
	});
});
