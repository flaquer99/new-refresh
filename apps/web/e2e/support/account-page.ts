import type { Page } from "@playwright/test";

export class AccountPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(): Promise<void> {
		await this.page.goto("/account");
	}

	async changeName(firstName: string, lastName: string): Promise<void> {
		await this.page.getByRole("button", { name: /update profile/i }).click();
		await this.page.getByLabel("First name").fill(firstName);
		await this.page.getByLabel("Last name").fill(lastName);
		await this.page.getByRole("button", { name: "Save" }).click();
	}

	async addPhone(phone: string): Promise<void> {
		await this.page.getByRole("button", { name: /add phone number/i }).click();
		await this.page.getByLabel(/phone number/i).fill(phone);
		await this.page.getByRole("button", { name: "Add" }).click();
	}
}
