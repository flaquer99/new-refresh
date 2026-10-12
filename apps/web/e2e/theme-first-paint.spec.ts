import { tabTo } from "./support/keyboard";
import { recordRootClasses, rootClassLog } from "./support/root-class-log";
import { expect, test } from "./support/test";
import {
	expectDarkApplied,
	themeOption,
	themeTrigger,
} from "./support/theme-menu";

test.describe("E2E-05 — no flash of the wrong theme on first paint", () => {
	test("never renders the document without the stored dark class", async ({
		page,
	}) => {
		// GIVEN
		await page.emulateMedia({ colorScheme: "light" });
		await recordRootClasses(page, "dark");

		// WHEN
		await page.goto("/");
		await expectDarkApplied(page, true);

		// THEN
		const log = await rootClassLog(page);
		expect(log.length).toBeGreaterThan(0);
		expect(log.filter((value) => !value.split(" ").includes("dark"))).toEqual(
			[],
		);
	});
});

test.describe("E2E-06 — the theme menu is keyboard operable", () => {
	test("opens with Enter, selects with the arrows, and returns focus to the trigger", async ({
		page,
	}) => {
		// GIVEN
		await page.goto("/");
		await tabTo(page, themeTrigger(page));

		// WHEN
		await page.keyboard.press("Enter");
		await expect(themeOption(page, "System")).toBeFocused();
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");

		// THEN
		await expectDarkApplied(page, true);
		await expect(themeTrigger(page)).toBeFocused();
		await expect(themeTrigger(page)).toHaveText("Theme: Dark");
	});
});
