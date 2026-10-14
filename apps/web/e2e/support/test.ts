import { test as base, type TestInfo } from "@playwright/test";
import { CLOSED_ORIGIN, FIXTURES_ORIGIN } from "./ports";
import { ScanApp } from "./scan-app";
import { removeScans, seedPreviewScan } from "./seed-scans";

export const CLIENT_ID_HEADER = "x-forwarded-for";

export const clientIdFor = (testInfo: TestInfo): string =>
	`e2e-${testInfo.project.name}-${testInfo.testId}`;

type ScanFixtures = {
	app: ScanApp;
	previewScanPath: string;
};

export const test = base.extend<ScanFixtures>({
	page: async ({ page }, use, testInfo) => {
		await page.setExtraHTTPHeaders({
			[CLIENT_ID_HEADER]: clientIdFor(testInfo),
		});
		await use(page);
	},
	previewScanPath: async ({ page: _page }, use) => {
		const scanId = seedPreviewScan({
			fixtures: FIXTURES_ORIGIN,
			closed: CLOSED_ORIGIN,
		});
		await use(`/scans/${scanId}`);
		removeScans([scanId]);
	},
	app: async ({ page }, use) => {
		const app = new ScanApp(page);
		await app.open();
		await use(app);
	},
});

export { expect } from "@playwright/test";
