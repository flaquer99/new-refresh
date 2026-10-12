import { fixtureUrl } from "./support/ports";
import { ScanHistoryPage } from "./support/scan-history-page";
import { CLIENT_ID_HEADER, clientIdFor, expect, test } from "./support/test";

const CLEAN_URL = fixtureUrl("/clean/");
const LARGE_SITE_URL = fixtureUrl("/large/");
const HTTP_CONFLICT = 409;
const ALREADY_RUNNING = /already running for you/;

test.describe("E2E-03 — a reloaded scan link keeps its report", () => {
	test("shows the same summary after a reload", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: CLEAN_URL });
		const before = await app.page
			.getByRole("region", { name: "Summary" })
			.textContent();

		// WHEN
		await app.page.reload();

		// THEN
		await expect(app.page.getByRole("region", { name: "Summary" })).toHaveText(
			before ?? "",
		);
	});

	test("does not ask for confirmation before reloading", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: CLEAN_URL });
		const dialogs: string[] = [];
		app.page.on("dialog", (dialog) => dialogs.push(dialog.type()));

		// WHEN
		await app.page.reload();

		// THEN
		await expect(app.reportHeading()).toBeVisible();
		expect(dialogs).toEqual([]);
	});
});

test.describe("E2E-14 — a second scan cannot start while one runs", () => {
	test("offers no form on the running scan's link", async ({ app }) => {
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

	test("shows the conflict inline and adds no history entry", async ({
		app,
		context,
	}, testInfo) => {
		// GIVEN
		const secondUrl = fixtureUrl(`/clean/?second=${testInfo.testId}`);
		await app.submit({ url: LARGE_SITE_URL, depth: 1 });
		await expect(app.progressHeading()).toBeVisible();
		const second = await context.newPage();
		await second.setExtraHTTPHeaders({
			[CLIENT_ID_HEADER]: clientIdFor(testInfo),
		});
		await second.goto("/");

		// WHEN
		await second.getByLabel("Website address").fill(secondUrl);
		await second.getByRole("button", { name: "Scan", exact: true }).click();

		// THEN
		await expect(second.getByRole("main").getByRole("alert")).toHaveText(
			ALREADY_RUNNING,
		);
		const history = new ScanHistoryPage(second);
		await history.open();
		await expect(history.entriesFor(secondUrl)).toHaveCount(0);
		await app.cancelToReport();
	});
});
