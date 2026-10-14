import type { Locator, Page } from "@playwright/test";

export class SiteHeaderControls {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	banner(): Locator {
		return this.page.getByRole("banner");
	}

	organizationBadge(name: string): Locator {
		return this.banner().getByText(name);
	}

	userButton(): Locator {
		return this.banner().getByRole("button", { name: /open user menu/i });
	}

	async signOut(): Promise<void> {
		await this.userButton().click();
		await this.page.getByRole("menuitem", { name: /sign out/i }).click();
	}

	signInButton(): Locator {
		return this.banner().getByRole("button", { name: "Sign in" });
	}

	signUpButton(): Locator {
		return this.banner().getByRole("button", { name: "Sign up" });
	}
}
