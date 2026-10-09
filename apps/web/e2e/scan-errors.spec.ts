import { CLOSED_ORIGIN } from "./support/ports";
import { SCAN_TIMEOUT_MS } from "./support/scan-app";
import { expect, test } from "./support/test";

const PRIVATE_NETWORK = /private or local network/;
const UNREACHABLE = /couldn't reach 127\.0\.0\.1/;
const LOCALHOST_URL = "http://localhost:8080/admin";
const HTTP_UNPROCESSABLE = 422;

test.describe("E2E-03 — a user submits a localhost URL", () => {
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
});

test.describe("E2E-04 — a user scans an unreachable site", () => {
	test("shows that the site could not be reached", async ({ app }) => {
		// WHEN
		await app.submit({ url: `${CLOSED_ORIGIN}/` });

		// THEN
		await expect(app.alert()).toHaveText(UNREACHABLE, {
			timeout: SCAN_TIMEOUT_MS,
		});
	});

	test("restores the form with the submitted URL via the back button", async ({
		app,
	}) => {
		// GIVEN
		await app.submit({ url: `${CLOSED_ORIGIN}/` });
		const back = app.page.getByRole("button", { name: "Back to form" });
		await back.waitFor({ timeout: SCAN_TIMEOUT_MS });

		// WHEN
		await back.click();

		// THEN
		await expect(app.urlField()).toHaveValue(`${CLOSED_ORIGIN}/`);
	});
});
