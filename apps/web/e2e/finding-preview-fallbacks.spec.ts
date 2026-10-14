import { openSeededReport, violationName } from "./support/seeded-report";
import { expect, test } from "./support/test";

const NOT_FOUND_COPY = "The element was not found.";
const HIDDEN_COPY = "The element is on the page but not visible on screen.";
const UNSUPPORTED_COPY = "Highlighting inside embedded content";
const MULTIPLE_MATCHES_COPY = "This selector matches 3 elements";
const NOT_FOUND_ROUTE_COPY = "Preview unavailable: the page returned HTTP 404.";
const BLOCKED_COPY = "Preview unavailable: the page's address isn't allowed.";
const UNREACHABLE_COPY = "Preview unavailable: the page couldn't be reached.";

const openPreview = async (
	page: Parameters<typeof openSeededReport>[0],
	scanPath: string,
	findingId: string,
) => {
	const report = await openSeededReport(page, scanPath);
	const preview = report.previewOf(violationName(findingId));
	await preview.open();
	return preview;
};

test.describe("E2E-06 — a finding on a missing route", () => {
	test("explains the HTTP error and offers the page in a new tab", async ({
		page,
		previewScanPath,
	}) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "missing-route");

		// THEN
		await expect(preview.status()).toHaveText(NOT_FOUND_ROUTE_COPY);
		await expect(preview.newTabLink()).toBeVisible();
	});
});

test.describe("E2E-07 — a finding whose element was removed", () => {
	test("shows the page and says the element was not found", async ({
		page,
		previewScanPath,
	}) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "removed");

		// THEN
		await expect(preview.status()).toContainText(NOT_FOUND_COPY);
		await expect(preview.frameElement()).toBeVisible();
		await expect(preview.overlay()).toHaveCount(0);
	});
});

test.describe("E2E-08 — a finding whose element is hidden", () => {
	test("says the element is not visible on screen", async ({
		page,
		previewScanPath,
	}) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "hidden");

		// THEN
		await expect(preview.status()).toHaveText(HIDDEN_COPY);
	});
});

test.describe("E2E-09 — a finding inside shadow DOM", () => {
	test("says highlighting inside embedded content is unsupported", async ({
		page,
		previewScanPath,
	}) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "shadow");

		// THEN
		await expect(preview.status()).toContainText(UNSUPPORTED_COPY);
	});
});

test.describe("E2E-10 — a selector with several matches", () => {
	test("highlights one element and notes the other matches", async ({
		page,
		previewScanPath,
	}) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "duplicates");

		// THEN
		await expect(preview.status()).toContainText(MULTIPLE_MATCHES_COPY);
		await expect(preview.overlay()).toHaveCount(1);
	});
});

test.describe("E2E-12 — pages the scanner may not reach", () => {
	test("refuses a private address", async ({ page, previewScanPath }) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "blocked");

		// THEN
		await expect(preview.status()).toHaveText(BLOCKED_COPY);
	});

	test("reports a closed port as unreachable", async ({
		page,
		previewScanPath,
	}) => {
		// WHEN
		const preview = await openPreview(page, previewScanPath, "closed");

		// THEN
		await expect(preview.status()).toHaveText(UNREACHABLE_COPY);
	});
});
