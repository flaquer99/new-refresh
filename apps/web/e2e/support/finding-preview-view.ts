import type { FrameLocator, Locator, Page } from "@playwright/test";

const FRAME_SELECTOR = "[data-preview-frame]";
const OVERLAY_SELECTOR = "[data-refresh-highlight]";

export class FindingPreviewView {
	readonly page: Page;
	readonly card: Locator;

	constructor(page: Page, card: Locator) {
		this.page = page;
		this.card = card;
	}

	toggle(): Locator {
		return this.card.getByRole("button", { name: /^(Show|Hide) preview$/ });
	}

	status(): Locator {
		return this.card.getByRole("status");
	}

	frameElement(): Locator {
		return this.card.locator(FRAME_SELECTOR);
	}

	frame(): FrameLocator {
		return this.card.frameLocator(FRAME_SELECTOR);
	}

	overlay(): Locator {
		return this.frame().locator(OVERLAY_SELECTOR);
	}

	viewportButton(label: "Desktop" | "Mobile"): Locator {
		return this.card
			.getByRole("group", { name: "Preview viewport" })
			.getByRole("button", { name: label });
	}

	viewportLabel(label: string): Locator {
		return this.card.getByText(label).last();
	}

	newTabLink(): Locator {
		return this.card.getByRole("link", { name: /Open page in new tab/ });
	}

	async open(): Promise<void> {
		await this.toggle().click();
	}
}
