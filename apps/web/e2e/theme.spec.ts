import { expect, test } from "./support/test";
import {
	chooseTheme,
	expectDarkApplied,
	storedTheme,
	themeOption,
	themeTrigger,
} from "./support/theme-menu";

const PAGES = ["/", "/scans"] as const;

test.describe("E2E-02 — the theme menu switches Light and Dark on any page", () => {
	for (const path of PAGES) {
		test(`switches to Dark and back to Light on ${path}`, async ({ page }) => {
			// GIVEN
			await page.goto(path);

			// WHEN
			await chooseTheme(page, "Dark");

			// THEN
			await expectDarkApplied(page, true);
			await expect(themeTrigger(page)).toHaveText("Theme: Dark");

			// WHEN
			await chooseTheme(page, "Light");

			// THEN
			await expectDarkApplied(page, false);
			await expect(themeTrigger(page)).toHaveText("Theme: Light");
		});
	}

	test("offers exactly System, Light, and Dark with the active one checked", async ({
		page,
	}) => {
		// GIVEN
		await page.goto("/");

		// WHEN
		await themeTrigger(page).click();

		// THEN
		const options = page.getByRole("menuitemradio");
		await expect(options).toHaveText(["System", "Light", "Dark"]);
		await expect(themeOption(page, "System")).toBeChecked();
	});
});

test.describe("E2E-03 — System follows the OS and reacts live", () => {
	test("applies the OS scheme and reacts when it changes", async ({ page }) => {
		// GIVEN
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/");

		// WHEN
		await page.emulateMedia({ colorScheme: "dark" });

		// THEN
		await expectDarkApplied(page, true);
		await expect(themeTrigger(page)).toHaveText("Theme: System");

		// WHEN
		await page.emulateMedia({ colorScheme: "light" });

		// THEN
		await expectDarkApplied(page, false);
	});
});

test.describe("E2E-04 — the choice persists across reload", () => {
	test("keeps Dark after a reload and stores it under refresh-theme", async ({
		page,
	}) => {
		// GIVEN
		await page.emulateMedia({ colorScheme: "light" });
		await page.goto("/");
		await chooseTheme(page, "Dark");

		// WHEN
		await page.reload();

		// THEN
		await expectDarkApplied(page, true);
		await expect(themeTrigger(page)).toHaveText("Theme: Dark");
		expect(await storedTheme(page)).toBe("dark");
	});
});
