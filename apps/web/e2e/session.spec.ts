import { fixtureUrl } from "./support/ports";
import { CLIENT_ID_HEADER, clientIdFor, expect, test } from "./support/test";

const CLEAN_URL = fixtureUrl("/clean/");
const LARGE_SITE_URL = fixtureUrl("/large/");
const HTTP_CONFLICT = 409;

test.describe("E2E-09 — reload on a report asks for confirmation", () => {
	test("asks the browser to confirm before reloading", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: CLEAN_URL });

		// WHEN
		const dialogType = await app.reloadAccepting();

		// THEN
		expect(dialogType).toBe("beforeunload");
	});

	test("shows the form and drops the report after the reload", async ({
		app,
	}) => {
		// GIVEN
		await app.scanToReport({ url: CLEAN_URL });

		// WHEN
		await app.reloadAccepting();

		// THEN
		await expect(app.urlField()).toBeVisible();
		await expect(app.reportHeading()).toHaveCount(0);
	});
});

test.describe("E2E-10 — a second scan cannot start while one runs", () => {
	test("offers no form while a scan is in progress", async ({ app }) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });

		// WHEN
		await expect(app.progressHeading()).toBeVisible();

		// THEN
		await expect(app.urlField()).toHaveCount(0);
		await app.cancelToReport();
	});

	test("rejects a direct API request with 409", async ({ app }, testInfo) => {
		// GIVEN
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		await expect(app.progressHeading()).toBeVisible();

		// WHEN
		const response = await app.page.request.post("/api/scans", {
			data: { url: CLEAN_URL, depth: 0 },
			headers: { [CLIENT_ID_HEADER]: clientIdFor(testInfo) },
		});

		// THEN
		expect(response.status()).toBe(HTTP_CONFLICT);
		await app.cancelToReport();
	});
});
