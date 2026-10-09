import { expect, type Locator, type Page } from "@playwright/test";

const MAX_TAB_STOPS = 20;

const isFocused = (target: Locator): Promise<boolean> =>
	target.evaluate((element) => element === document.activeElement);

export const tabTo = async (
	page: Page,
	target: Locator,
	remainingStops = MAX_TAB_STOPS,
): Promise<void> => {
	if (await isFocused(target)) {
		return;
	}
	if (remainingStops === 0) {
		await expect(target).toBeFocused();
		return;
	}
	await page.keyboard.press("Tab");
	await tabTo(page, target, remainingStops - 1);
};

export const hasVisibleFocus = (target: Locator): Promise<boolean> =>
	target.evaluate((element) => {
		const style = getComputedStyle(element);
		const hasOutline =
			style.outlineStyle !== "none" &&
			Number.parseFloat(style.outlineWidth) > 0;
		return element.matches(":focus-visible") && hasOutline;
	});
