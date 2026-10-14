import { findWcagViolations } from "./support/axe";
import { tabTo } from "./support/keyboard";
import {
	HIGHLIGHTED,
	openSeededReport,
	reviewItemName,
	violationName,
} from "./support/seeded-report";
import { expect, test } from "./support/test";

const MAX_TAB_STOPS = 150;
const TABS_AFTER_OPENING = 3;
const PHONE_WIDTH = 320;
const PHONE_HEIGHT = 640;

test.describe("E2E-13 — a keyboard user previews a finding", () => {
	test("opens the preview with Enter and never gets trapped in the frame", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(violationName("mobile-only"));
		await tabTo(page, preview.toggle(), MAX_TAB_STOPS);

		// WHEN
		await page.keyboard.press("Enter");

		// THEN
		await expect(preview.toggle()).toHaveAttribute("aria-expanded", "true");
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
		await page.keyboard.press("Tab");
		await expect(preview.newTabLink()).toBeFocused();
		for (let stop = 0; stop < TABS_AFTER_OPENING; stop += 1) {
			await page.keyboard.press("Tab");
			const focusedTag = await page.evaluate(
				() => document.activeElement?.tagName,
			);
			expect(focusedTag).not.toBe("IFRAME");
		}
	});
});

test.describe("E2E-14 — a desktop preview on a phone", () => {
	test.use({ viewport: { width: PHONE_WIDTH, height: PHONE_HEIGHT } });

	test("fits inside the card without horizontal scrolling", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(violationName("both"));

		// WHEN
		await preview.open();
		await expect(preview.status()).toHaveText(HIGHLIGHTED);

		// THEN
		const scrollWidth = await page.evaluate(
			() => document.scrollingElement?.scrollWidth ?? 0,
		);
		expect(scrollWidth).toBeLessThanOrEqual(PHONE_WIDTH);
	});
});

test.describe("E2E-16 — the report passes its own scan with previews open", () => {
	test("has no WCAG A/AA violations with three previews open", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const report = await openSeededReport(page, previewScanPath);
		const names = [
			violationName("mobile-only"),
			violationName("both"),
			reviewItemName("review"),
		];
		for (const name of names) {
			const preview = report.previewOf(name);
			await preview.open();
			await expect(preview.status()).toHaveText(HIGHLIGHTED);
		}

		// WHEN
		const violations = await findWcagViolations(page);

		// THEN
		expect(violations).toEqual([]);
	});
});
