import type { Locator, Page } from "@playwright/test";

const OLDEST_POSSIBLE_CURSOR = Buffer.from(
	"2000-01-01T00:00:00.000Z|00000000-0000-4000-8000-000000000000",
).toString("base64url");

export class ScanHistoryPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(): Promise<void> {
		await this.page.goto("/scans");
	}

	async openPastTheEnd(): Promise<void> {
		await this.page.goto(`/scans?before=${OLDEST_POSSIBLE_CURSOR}`);
	}

	entries(): Locator {
		return this.page.getByRole("main").getByRole("article");
	}

	entriesFor(startUrl: string): Locator {
		return this.entries().filter({
			has: this.page.getByRole("link", { name: startUrl, exact: true }),
		});
	}

	entry(scanId: string): Locator {
		return this.entries().filter({
			has: this.page.locator(`a[href="/scans/${scanId}"]`),
		});
	}

	olderScans(): Locator {
		return this.page.getByRole("link", { name: "Older scans" });
	}

	deleteButton(startUrl: string): Locator {
		return this.page.getByRole("button", {
			name: `Delete scan of ${startUrl}`,
		});
	}

	dialog(): Locator {
		return this.page.getByRole("dialog");
	}
}
