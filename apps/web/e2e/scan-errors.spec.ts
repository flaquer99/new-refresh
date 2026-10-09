import { CLOSED_ORIGIN } from "./support/ports";
import { SCAN_TIMEOUT_MS } from "./support/scan-app";
import { ScanHistoryPage } from "./support/scan-history-page";
import { failureSection } from "./support/scan-link-page";
import { expect, test } from "./support/test";

const PRIVATE_NETWORK = /private or local network/;
const UNREACHABLE = /couldn't reach 127\.0\.0\.1/;
const LOCALHOST_URL = "http://localhost:8080/admin";
const UNREACHABLE_URL = `${CLOSED_ORIGIN}/`;
const HTTP_UNPROCESSABLE = 422;

test.describe("E2E-02 — a user submits a localhost URL", () => {
	test("rejects the address as a private or local network", async ({ app }) => {
		// WHEN
		await app.submit({ url: LOCALHOST_URL });

		// THEN
		await expect(app.alert()).toHaveText(PRIVATE_NETWORK);
	});

	test("does not start a scan", async ({ app }) => {
		// GIVEN
		const started = app.page.waitForResponse("**/api/scans");

		// WHEN
		await app.submit({ url: LOCALHOST_URL });

		// THEN
		expect((await started).status()).toBe(HTTP_UNPROCESSABLE);
	});

	test("adds nothing to the scan history", async ({ app }) => {
		// GIVEN
		await app.submit({ url: LOCALHOST_URL });
		await expect(app.alert()).toBeVisible();
		const history = new ScanHistoryPage(app.page);

		// WHEN
		await history.open();

		// THEN
		await expect(history.entriesFor(LOCALHOST_URL)).toHaveCount(0);
	});
});

test.describe("E2E-06 — a user scans an unreachable site", () => {
	test("shows that the site could not be reached", async ({ app }) => {
		// WHEN
		await app.submit({ url: UNREACHABLE_URL });

		// THEN
		await expect(failureSection(app.page)).toContainText(UNREACHABLE, {
			timeout: SCAN_TIMEOUT_MS,
		});
	});

	test("runs the scan again from the form with the same URL and depth", async ({
		app,
	}) => {
		// GIVEN
		await app.submit({ url: UNREACHABLE_URL, depth: 2 });
		const runAgain = app.page.getByRole("link", { name: "Run again" });
		await runAgain.waitFor({ timeout: SCAN_TIMEOUT_MS });

		// WHEN
		await runAgain.click();

		// THEN
		await expect(app.urlField()).toHaveValue(UNREACHABLE_URL);
		await expect(app.page.getByLabel("Crawl depth")).toHaveValue("2");
	});
});
