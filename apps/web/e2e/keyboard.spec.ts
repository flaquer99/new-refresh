import { hasVisibleFocus, tabTo } from "./support/keyboard";
import { fixtureUrl } from "./support/ports";
import { SCAN_TIMEOUT_MS, type ScanApp } from "./support/scan-app";
import { expect, test } from "./support/test";

const LARGE_SITE_URL = fixtureUrl("/large/");

const button = (app: ScanApp, name: string) =>
	app.page.getByRole("button", { name, exact: true });

const startWithKeyboard = async (app: ScanApp): Promise<void> => {
	await tabTo(app.page, app.urlField());
	await app.page.keyboard.type(LARGE_SITE_URL);
	await tabTo(app.page, app.page.getByLabel("Crawl depth"));
	await app.page.keyboard.press("1");
	await tabTo(app.page, button(app, "Scan"));
	await app.page.keyboard.press("Enter");
};

const cancelWithKeyboard = async (app: ScanApp): Promise<void> => {
	await tabTo(app.page, button(app, "Cancel scan"));
	await app.page.keyboard.press("Enter");
	await expect(app.reportHeading()).toBeFocused({ timeout: SCAN_TIMEOUT_MS });
};

const openNewScanDialog = async (app: ScanApp): Promise<void> => {
	await tabTo(app.page, button(app, "New scan"));
	await app.page.keyboard.press("Enter");
};

test.describe("E2E-12 — the full journey works with the keyboard only", () => {
	test("completes scan, cancel, and new scan with the keyboard", async ({
		app,
	}) => {
		// GIVEN
		await startWithKeyboard(app);
		await cancelWithKeyboard(app);
		await openNewScanDialog(app);
		await app.page.keyboard.press("Escape");
		await openNewScanDialog(app);

		// WHEN
		await tabTo(app.page, button(app, "Start a new scan"));
		await app.page.keyboard.press("Enter");

		// THEN
		await expect(
			app.page.getByRole("heading", { name: "Scan a website" }),
		).toBeFocused();
	});

	test("keeps the report when the new scan dialog is closed with Esc", async ({
		app,
	}) => {
		// GIVEN
		await startWithKeyboard(app);
		await cancelWithKeyboard(app);
		await openNewScanDialog(app);

		// WHEN
		await app.page.keyboard.press("Escape");

		// THEN
		await expect(app.page.getByRole("dialog")).toHaveCount(0);
		await expect(app.reportHeading()).toBeVisible();
	});

	test("shows a visible focus indicator on every form control", async ({
		app,
	}) => {
		// GIVEN
		const controls = [
			app.urlField(),
			app.page.getByLabel("Crawl depth"),
			button(app, "Scan"),
		];
		const visible: boolean[] = [];

		// WHEN
		for (const control of controls) {
			await tabTo(app.page, control);
			visible.push(await hasVisibleFocus(control));
		}

		// THEN
		expect(visible).toEqual([true, true, true]);
	});

	test("announces progress in a polite live region", async ({ app }) => {
		// GIVEN
		await startWithKeyboard(app);

		// WHEN
		await app.waitForScannedPage();

		// THEN
		await expect(app.progressStatus()).toHaveAttribute("aria-live", "polite");
		await cancelWithKeyboard(app);
	});
});
