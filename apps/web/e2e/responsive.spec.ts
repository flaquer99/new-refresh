import type { Page } from "@playwright/test";
import { expect, test } from "./support/test";
import { openView, VIEW_NAMES } from "./support/views";

const WIDTHS = [320, 768, 1280, 1920];
const HEIGHT = 800;
const NARROW_WIDTH = 320;

const horizontalOverflow = (page: Page) =>
	page.evaluate(
		() =>
			document.documentElement.scrollWidth -
			document.documentElement.clientWidth,
	);

test.describe("E2E-09 — no view scrolls horizontally", () => {
	for (const view of VIEW_NAMES) {
		test(`fits ${view} at every width`, async ({ app }) => {
			// GIVEN
			await openView(app, view);

			for (const width of WIDTHS) {
				// WHEN
				await app.page.setViewportSize({ width, height: HEIGHT });

				// THEN
				expect(
					await horizontalOverflow(app.page),
					`${view} at ${width}`,
				).toBeLessThanOrEqual(0);
			}

			if (view === "progress") {
				await app.cancelToReport();
			}
		});
	}
});

test.describe("E2E-10 — 400% zoom keeps content reachable", () => {
	test("keeps the history heading inside the viewport width", async ({
		app,
	}) => {
		// GIVEN
		await openView(app, "history");
		await app.page.setViewportSize({ width: NARROW_WIDTH, height: HEIGHT });

		// WHEN
		const box = await app.page.getByRole("heading", { level: 1 }).boundingBox();

		// THEN
		expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
		expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(NARROW_WIDTH);
		expect(await horizontalOverflow(app.page)).toBeLessThanOrEqual(0);
	});

	test("keeps the report filters inside the viewport width", async ({
		app,
	}) => {
		// GIVEN
		await openView(app, "long-report");
		await app.page.setViewportSize({ width: NARROW_WIDTH, height: HEIGHT });

		// WHEN
		const filter = app.report.violationsRegion().getByRole("combobox").first();
		await filter.scrollIntoViewIfNeeded();
		const box = await filter.boundingBox();

		// THEN
		expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
		expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(NARROW_WIDTH);
		expect(await horizontalOverflow(app.page)).toBeLessThanOrEqual(0);
	});
});
