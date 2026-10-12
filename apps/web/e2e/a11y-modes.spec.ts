import { longestMotionSeconds } from "./support/motion";
import { fixtureUrl } from "./support/ports";
import { ScanHistoryPage } from "./support/scan-history-page";
import { expect, test } from "./support/test";
import { openView } from "./support/views";

const REDUCED_LIMIT_SECONDS = 0.011;
const MOTION_VIEWS = ["form", "progress"] as const;

test.describe("E2E-19 — reduced motion stops decorative animation", () => {
	for (const view of MOTION_VIEWS) {
		test(`limits every animation and transition to 0.01s on ${view}`, async ({
			app,
		}) => {
			// GIVEN
			await app.page.emulateMedia({ reducedMotion: "reduce" });
			await openView(app, view);

			// WHEN
			const longest = await longestMotionSeconds(app.page);

			// THEN
			expect(longest).toBeLessThanOrEqual(REDUCED_LIMIT_SECONDS);
			if (view === "progress") {
				await app.cancelToReport();
			}
		});
	}

	test("limits the delete dialog animation to 0.01s", async ({ app }) => {
		// GIVEN
		await app.page.emulateMedia({ reducedMotion: "reduce" });
		await openView(app, "history");
		const history = new ScanHistoryPage(app.page);

		// WHEN
		await history.deleteButton(fixtureUrl("/clean/")).first().click();
		await expect(history.dialog()).toBeVisible();

		// THEN
		expect(await longestMotionSeconds(app.page)).toBeLessThanOrEqual(
			REDUCED_LIMIT_SECONDS,
		);
	});
});

test.describe("E2E-20 — forced colors keeps controls visible", () => {
	test("gives the focused field and the primary button an edge", async ({
		page,
	}) => {
		// GIVEN
		await page.emulateMedia({ forcedColors: "active" });
		await page.goto("/");

		// WHEN
		await page.getByLabel("Website address").focus();
		const edges = await page.evaluate(() => {
			const widthOf = (element: Element | null, property: string) =>
				Number.parseFloat(
					element ? getComputedStyle(element).getPropertyValue(property) : "0",
				);
			const button = [...document.querySelectorAll("button")].find(
				(element) => element.textContent?.trim() === "Scan",
			);
			return {
				focused:
					widthOf(document.activeElement, "outline-width") +
					widthOf(document.activeElement, "border-top-width"),
				button: widthOf(button ?? null, "border-top-width"),
			};
		});

		// THEN
		expect(edges.focused).toBeGreaterThan(0);
		expect(edges.button).toBeGreaterThan(0);
	});

	test("outlines a badge in the report", async ({ app }) => {
		// GIVEN
		await app.page.emulateMedia({ forcedColors: "active" });
		await app.scanToReport({ url: fixtureUrl("/long-selectors/") });

		// WHEN
		const border = await app.page.evaluate(() => {
			const label = [...document.querySelectorAll("span.sr-only")].find(
				(element) => element.textContent === "Severity: ",
			);
			const badge = label?.parentElement;
			return Number.parseFloat(
				badge ? getComputedStyle(badge).borderTopWidth : "0",
			);
		});

		// THEN
		expect(border).toBeGreaterThan(0);
	});
});
