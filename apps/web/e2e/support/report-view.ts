import type { Locator, Page } from "@playwright/test";

export const definitionOf = (scope: Locator | Page, term: string): Locator =>
	scope
		.getByRole("term")
		.filter({ hasText: new RegExp(`^${term}$`) })
		.locator("xpath=following-sibling::dd[1]");

export class ReportView {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	violationsRegion(): Locator {
		return this.page.getByRole("region", { name: "Violations" });
	}

	violation(criterionId: string): Locator {
		return this.violationsRegion()
			.getByRole("article")
			.filter({ hasText: `${criterionId} ` })
			.first();
	}

	violationGroupHeadings(): Locator {
		return this.violationsRegion().getByRole("heading", { level: 3 });
	}

	filterCount(): Locator {
		return this.violationsRegion().getByRole("status");
	}

	async choose(label: string, option: string): Promise<void> {
		await this.violationsRegion()
			.getByLabel(label)
			.selectOption({ label: option });
	}

	coverageGroup(title: string): Locator {
		return this.page
			.getByRole("heading", { name: new RegExp(`^${title} \\(\\d+\\)$`) })
			.locator("xpath=following-sibling::ul[1]");
	}

	coverageItem(title: string, url: string): Locator {
		return this.coverageGroup(title)
			.getByRole("listitem")
			.filter({ hasText: url });
	}

	summaryValue(term: string): Locator {
		return definitionOf(this.page, term);
	}
}
