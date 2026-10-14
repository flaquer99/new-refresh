import { FIXTURES_ORIGIN } from "./support/ports";
import {
	HIGHLIGHTED,
	openSeededReport,
	violationName,
} from "./support/seeded-report";
import { expect, test } from "./support/test";

const FIXTURE_PREVIEW_PATH = "/preview/";

test.describe("E2E-11 — a hostile page cannot escape its frame", () => {
	test("keeps the report in place and sends no popup or form", async ({
		page,
		previewScanPath,
	}) => {
		// GIVEN
		const popups: string[] = [];
		const fixtureRequests: { method: string; path: string }[] = [];
		page.on("popup", (popup) => popups.push(popup.url()));
		page.on("request", (request) => {
			const { origin, pathname } = new URL(request.url());
			if (origin === FIXTURES_ORIGIN) {
				fixtureRequests.push({ method: request.method(), path: pathname });
			}
		});
		const report = await openSeededReport(page, previewScanPath);
		const preview = report.previewOf(violationName("hostile"));
		const reportUrl = page.url();

		// WHEN
		await preview.open();
		await expect(preview.status()).toHaveText(HIGHLIGHTED);

		// THEN
		expect(page.url()).toBe(reportUrl);
		expect(popups).toEqual([]);
		const hostileRequests = fixtureRequests.filter(
			({ path }) => path.startsWith(FIXTURE_PREVIEW_PATH) || path === "/",
		);
		expect(hostileRequests.filter(({ method }) => method === "POST")).toEqual(
			[],
		);
		expect(hostileRequests.map(({ path }) => path)).not.toContain(
			"/preview/escaped.html",
		);
	});
});
