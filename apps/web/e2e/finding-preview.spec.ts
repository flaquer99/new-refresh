import { fixtureUrl } from "./support/ports";
import { definitionOf } from "./support/report-view";
import {
	HIGHLIGHTED,
	openSeededReport,
	reviewItemName,
	violationName,
} from "./support/seeded-report";
import { expect, test } from "./support/test";

const LOW_CONTRAST_URL = fixtureUrl("/low-contrast/");
const PREVIEW_REQUEST = /\/findings\/[^/]+\/preview$/;
const FAINT_COLOR = "rgb(170, 170, 170)";
const MOBILE_FRAME_WIDTH = "320";

test.describe("E2E-01 — a user previews the element behind a violation", () => {
	test("outlines and centers the element in the live page", async ({ app }) => {
		// GIVEN
		await app.scanToReport({ url: LOW_CONTRAST_URL });
		const preview = app.report.firstViolationPreview();

		// WHEN
		await preview.open();

		// THEN
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
		const overlay = await preview.overlay().evaluate((element) => {
			const { top, bottom } = element.getBoundingClientRect();
			return { top, bottom };
		});
		const target = await preview
			.frame()
			.locator(".faint")
			.evaluate((element) => {
				const { top, bottom } = element.getBoundingClientRect();
				const viewportHeight = element.ownerDocument.defaultView?.innerHeight;
				const color = getComputedStyle(element).color;
				return { top, bottom, viewportHeight, color };
			});
		expect(overlay.top).toBeLessThan(target.bottom);
		expect(overlay.bottom).toBeGreaterThan(target.top);
		expect(target.top).toBeGreaterThanOrEqual(0);
		expect(target.bottom).toBeLessThanOrEqual(target.viewportHeight ?? 0);
		expect(target.color).toBe(FAINT_COLOR);
	});
});

test.describe("E2E-02 — the report does not load previews on its own", () => {
	test("requests no preview before the user asks for one", async ({ app }) => {
		// GIVEN
		const previewRequests: string[] = [];
		app.page.on("request", (request) => {
			if (PREVIEW_REQUEST.test(new URL(request.url()).pathname)) {
				previewRequests.push(request.url());
			}
		});

		// WHEN
		await app.scanToReport({ url: LOW_CONTRAST_URL });
		await expect(app.report.firstViolationPreview().toggle()).toBeVisible();

		// THEN
		expect(previewRequests).toEqual([]);
	});
});

test.describe("E2E-03 — a mobile-only finding renders at phone width", () => {
	test("sizes the frame to 320 px and labels it Mobile", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(violationName("mobile-only"));

		// WHEN
		await preview.open();

		// THEN
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
		await expect(preview.frameElement()).toHaveAttribute(
			"width",
			MOBILE_FRAME_WIDTH,
		);
		await expect(preview.viewportLabel("Mobile (320 px)")).toBeVisible();
	});
});

test.describe("E2E-04 — a two-viewport finding can switch viewports", () => {
	test("defaults to Desktop and re-highlights after switching to Mobile", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const previewRequests: string[] = [];
		page.on("request", (request) => {
			if (PREVIEW_REQUEST.test(new URL(request.url()).pathname)) {
				previewRequests.push(request.url());
			}
		});
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(violationName("both"));
		await preview.open();
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
		await expect(preview.viewportButton("Desktop")).toHaveAttribute(
			"aria-pressed",
			"true",
		);

		// WHEN
		await preview.viewportButton("Mobile").click();

		// THEN
		await expect(preview.viewportButton("Mobile")).toHaveAttribute(
			"aria-pressed",
			"true",
		);
		await expect(preview.frameElement()).toHaveAttribute(
			"data-viewport",
			"mobile",
		);
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
		await expect(preview.overlay()).toHaveCount(1);
		expect(previewRequests).toHaveLength(1);
	});
});

test.describe("E2E-05 — a needs-review item can be previewed", () => {
	test("highlights the element of a review item", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(reviewItemName("review"));

		// WHEN
		await preview.open();

		// THEN
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
	});
});

test.describe("E2E-17 — previewing keeps the finding details visible", () => {
	test("shows page, element, HTML, viewports, and guidance before, during, and after", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(violationName("both"));
		const terms = ["Page", "Element", "HTML", "Viewports"];
		const expectDetailsVisible = async () => {
			for (const term of terms) {
				await expect(definitionOf(preview.card, term)).toBeVisible();
			}
			await expect(preview.card.getByText("How to fix")).toBeVisible();
		};
		await expectDetailsVisible();

		// WHEN
		await preview.open();
		await expect(preview.status()).toHaveText(HIGHLIGHTED);
		await expectDetailsVisible();
		await preview.toggle().click();

		// THEN
		await expect(preview.frameElement()).toHaveCount(0);
		await expectDetailsVisible();
	});
});
