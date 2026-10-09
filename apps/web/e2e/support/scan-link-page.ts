import type { Locator, Page } from "@playwright/test";

const SCAN_LINK_PATH = /\/scans\/([0-9a-f-]{36})$/;

export const scanIdFromUrl = (url: string): string => {
	const scanId = SCAN_LINK_PATH.exec(new URL(url).pathname)?.[1];
	if (!scanId) {
		throw new Error(`${url} is not a scan link.`);
	}
	return scanId;
};

export const waitForScanLink = async (page: Page): Promise<string> => {
	await page.waitForURL(SCAN_LINK_PATH);
	return scanIdFromUrl(page.url());
};

export const failureSection = (page: Page): Locator =>
	page.getByRole("region", { name: "The scan couldn't finish" });

export const notFoundHeading = (page: Page): Locator =>
	page.getByRole("heading", { level: 1, name: "Scan not found" });
