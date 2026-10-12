import type { Page } from "@playwright/test";
import { THEME_STORAGE_KEY, type ThemeLabel } from "./theme-menu";

type ClassLogWindow = Window & { classLog?: string[] };

type StoredTheme = { key: string; value: string };

const watchRootClass = ({ key, value }: StoredTheme) => {
	window.localStorage.setItem(key, value);
	const log: string[] = [];
	Object.assign(window, { classLog: log });
	const watchRoot = () => {
		const root = document.documentElement;
		new MutationObserver(() => log.push(root.className)).observe(root, {
			attributes: true,
			attributeFilter: ["class"],
		});
		document.addEventListener("DOMContentLoaded", () =>
			log.push(root.className),
		);
	};
	if (document.documentElement) {
		watchRoot();
		return;
	}
	new MutationObserver((_records, observer) => {
		observer.disconnect();
		watchRoot();
	}).observe(document, { childList: true });
};

export const recordRootClasses = async (
	page: Page,
	stored: Lowercase<ThemeLabel>,
): Promise<void> => {
	await page.addInitScript(watchRootClass, {
		key: THEME_STORAGE_KEY,
		value: stored,
	});
};

export const rootClassLog = (page: Page): Promise<string[]> =>
	page.evaluate(() => (window as ClassLogWindow).classLog ?? []);
