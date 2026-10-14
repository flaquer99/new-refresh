import type { Browser } from "@playwright/test";
import type { TestUser } from "./clerk-users";
import { ScanApp } from "./scan-app";
import { waitForScanLink } from "./scan-link-page";
import { signInAs } from "./sign-in";

type StartScanParams = {
	browser: Browser;
	baseURL: string | undefined;
	user: TestUser;
	url: string;
};

export const completeScanAs = async ({
	browser,
	baseURL,
	user,
	url,
}: StartScanParams): Promise<string> => {
	const context = await browser.newContext({ baseURL });
	const page = await context.newPage();
	await signInAs(page, user);
	const app = new ScanApp(page);
	await app.open();
	await app.scanToReport({ url });
	const scanId = await waitForScanLink(page);
	await context.close();
	return scanId;
};
