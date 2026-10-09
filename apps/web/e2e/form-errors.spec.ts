import { expect, test } from "./support/test";

const INVALID_URL_MESSAGE =
	"Enter a full web address that starts with http:// or https://.";

test.describe("E2E-02 — a user submits an invalid URL", () => {
	test("announces an inline error next to the URL field", async ({ app }) => {
		// WHEN
		await app.submit({ url: "not a web address" });

		// THEN
		await expect(app.alert()).toHaveText(INVALID_URL_MESSAGE);
		await expect(app.urlField()).toHaveAttribute("aria-invalid", "true");
	});

	test("stays on the form without showing progress", async ({ app }) => {
		// WHEN
		await app.submit({ url: "ftp://example.org/" });

		// THEN
		await expect(app.alert()).toBeVisible();
		await expect(app.progressHeading()).toHaveCount(0);
	});
});
