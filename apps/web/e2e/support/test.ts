import { test as base, type TestInfo } from "@playwright/test";
import { ScanApp } from "./scan-app";

export const CLIENT_ID_HEADER = "x-forwarded-for";

export const clientIdFor = (testInfo: TestInfo): string =>
	`e2e-${testInfo.project.name}-${testInfo.testId}`;

type ScanFixtures = {
	app: ScanApp;
};

export const test = base.extend<ScanFixtures>({
	page: async ({ page }, use, testInfo) => {
		await page.setExtraHTTPHeaders({
			[CLIENT_ID_HEADER]: clientIdFor(testInfo),
		});
		await use(page);
	},
	app: async ({ page }, use) => {
		const app = new ScanApp(page);
		await app.open();
		await use(app);
	},
});

export { expect } from "@playwright/test";
