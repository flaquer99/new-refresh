import { expect, type Locator, type Page } from "@playwright/test";
import { ReportView } from "./report-view";

export const SCAN_TIMEOUT_MS = 60_000;
const REPORT_HEADING = /^Report for /;
const SCANNED_PROGRESS = /[1-9]\d* of \d+ discovered pages scanned/;

export type ScanInput = {
	url: string;
	depth?: number;
};

export class ScanApp {
	readonly page: Page;
	readonly report: ReportView;

	constructor(page: Page) {
		this.page = page;
		this.report = new ReportView(page);
	}

	async open(): Promise<void> {
		await this.page.goto("/");
	}

	urlField(): Locator {
		return this.page.getByLabel("Website address");
	}

	alert(): Locator {
		return this.page.getByRole("main").getByRole("alert");
	}

	progressHeading(): Locator {
		return this.page.getByRole("heading", { name: "Scan in progress" });
	}

	progressStatus(): Locator {
		return this.page.getByRole("main").getByRole("status");
	}

	reportHeading(): Locator {
		return this.page.getByRole("heading", { name: REPORT_HEADING });
	}

	async submit({ url, depth = 0 }: ScanInput): Promise<void> {
		await this.urlField().fill(url);
		await this.page.getByLabel("Crawl depth").selectOption(String(depth));
		await this.page.getByRole("button", { name: "Scan", exact: true }).click();
	}

	async scanToReport(input: ScanInput): Promise<void> {
		await this.submit(input);
		await expect(this.reportHeading()).toBeVisible({
			timeout: SCAN_TIMEOUT_MS,
		});
	}

	async waitForScannedPage(): Promise<void> {
		await expect(this.progressStatus()).toContainText(SCANNED_PROGRESS, {
			timeout: SCAN_TIMEOUT_MS,
		});
	}

	async reloadAccepting(): Promise<string> {
		const dialogShown = this.page.waitForEvent("dialog");
		const reloaded = this.page.reload();
		const dialog = await dialogShown;
		await dialog.accept();
		await reloaded;
		return dialog.type();
	}

	async cancelToReport(): Promise<void> {
		await this.page.getByRole("button", { name: "Cancel scan" }).click();
		await expect(this.reportHeading()).toBeVisible({
			timeout: SCAN_TIMEOUT_MS,
		});
	}
}
