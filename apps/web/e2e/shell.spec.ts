import { tabTo } from "./support/keyboard";
import { expect, test } from "./support/test";

const NARROW_VIEWPORT = { width: 320, height: 640 };

test.describe("E2E-11 — the skip link jumps to the main content", () => {
	test("shows the skip link on the first Tab and moves focus to main", async ({
		page,
	}) => {
		// GIVEN
		await page.goto("/");

		// WHEN
		await page.keyboard.press("Tab");
		const skipLink = page.getByRole("link", { name: "Skip to main content" });

		// THEN
		await expect(skipLink).toBeFocused();
		await expect(skipLink).toBeVisible();

		// WHEN
		await page.keyboard.press("Enter");

		// THEN
		await expect(page.getByRole("main")).toBeFocused();
	});
});

test.describe("E2E-12 — the header works at 320 px", () => {
	test.use({ viewport: NARROW_VIEWPORT });

	test("reaches every header control by keyboard without horizontal scroll", async ({
		page,
	}) => {
		// GIVEN
		await page.goto("/");
		const nav = page.getByRole("navigation", { name: "Main" });

		// WHEN
		await tabTo(page, nav.getByRole("link", { name: "New scan" }));
		await tabTo(page, nav.getByRole("link", { name: "Scan history" }));
		await tabTo(page, page.getByRole("button", { name: /^Theme/ }));

		// THEN
		const overflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
		await expect(nav.locator('[aria-current="page"]')).toHaveText("New scan");
	});

	test("navigates to Scan history by tap", async ({ page }) => {
		// GIVEN
		await page.goto("/");

		// WHEN
		await page
			.getByRole("navigation", { name: "Main" })
			.getByRole("link", { name: "Scan history" })
			.click();

		// THEN
		await expect(page).toHaveURL(/\/scans$/);
	});
});
