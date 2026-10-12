import { expect, type Locator, type Page } from "@playwright/test";

export type ThemeLabel = "System" | "Light" | "Dark";

export const THEME_STORAGE_KEY = "refresh-theme";

export const themeTrigger = (page: Page): Locator =>
	page.getByRole("button", { name: /^Theme/ });

export const themeOption = (page: Page, label: ThemeLabel): Locator =>
	page.getByRole("menuitemradio", { name: label });

export const chooseTheme = async (
	page: Page,
	label: ThemeLabel,
): Promise<void> => {
	await themeTrigger(page).click();
	await themeOption(page, label).click();
};

export const isDarkApplied = (page: Page): Promise<boolean> =>
	page.evaluate(() => document.documentElement.classList.contains("dark"));

export const expectDarkApplied = (page: Page, dark: boolean) =>
	expect.poll(() => isDarkApplied(page)).toBe(dark);

export const storedTheme = (page: Page): Promise<string | null> =>
	page.evaluate((key) => window.localStorage.getItem(key), THEME_STORAGE_KEY);
