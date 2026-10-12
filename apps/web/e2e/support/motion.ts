import type { Page } from "@playwright/test";

export const longestMotionSeconds = (page: Page): Promise<number> =>
	page.evaluate(() => {
		const longestOf = (value: string) =>
			Math.max(...value.split(",").map((part) => Number.parseFloat(part)));
		return Math.max(
			...[...document.querySelectorAll("*")].flatMap((element) => {
				const style = getComputedStyle(element);
				return [
					longestOf(style.animationDuration),
					longestOf(style.transitionDuration),
				];
			}),
		);
	});
