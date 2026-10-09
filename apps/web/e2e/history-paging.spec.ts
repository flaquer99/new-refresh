import { ScanHistoryPage } from "./support/scan-history-page";
import { removeScans, seedNewestScans } from "./support/seed-scans";
import { expect, test } from "./support/test";

const SEEDED_SCANS = 45;
const PAGE_COUNTS = [20, 20, 5];

const goToOlderScans = async (history: ScanHistoryPage) => {
	const href = await history.olderScans().getAttribute("href");
	await history.olderScans().click();
	await history.page.waitForURL(
		(url) => `${url.pathname}${url.search}` === href,
	);
	await expect(history.page.getByRole("heading", { level: 1 })).toHaveText(
		"Scan history — older scans",
	);
};

const countPages = async (history: ScanHistoryPage, seedUrl: string) => {
	const counts: number[] = [];
	for (let index = 0; index < PAGE_COUNTS.length; index += 1) {
		if (index > 0) {
			await goToOlderScans(history);
		}
		counts.push(await history.entriesFor(seedUrl).count());
	}
	return counts;
};

test.describe("E2E-07 — a user pages through the scan history", () => {
	let seeded: string[] = [];

	test.afterEach(() => {
		removeScans(seeded);
		seeded = [];
	});

	test("shows the newest scans 20 at a time through Older scans", async ({
		page,
	}, testInfo) => {
		// GIVEN
		const seedUrl = `https://seeded-${testInfo.testId}.example/`;
		seeded = seedNewestScans(SEEDED_SCANS, seedUrl);
		const history = new ScanHistoryPage(page);
		await history.open();

		// WHEN
		const counts = await countPages(history, seedUrl);

		// THEN
		expect(counts).toEqual(PAGE_COUNTS);
	});

	test("titles an older page so users know where they are", async ({
		page,
	}, testInfo) => {
		// GIVEN
		seeded = seedNewestScans(
			SEEDED_SCANS,
			`https://titled-${testInfo.testId}.example/`,
		);
		const history = new ScanHistoryPage(page);
		await history.open();

		// WHEN
		await history.olderScans().click();

		// THEN
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Scan history — older scans",
		);
		await expect(page).toHaveTitle("Scan history — older scans — Refresh");
	});
});
