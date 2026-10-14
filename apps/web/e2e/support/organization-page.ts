import type { Locator, Page } from "@playwright/test";

export class OrganizationPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(): Promise<void> {
		await this.page.goto("/organization");
	}

	async openMembers(): Promise<void> {
		await this.page
			.getByRole("button", { name: "Members", exact: true })
			.click();
	}

	async openGeneral(): Promise<void> {
		await this.page
			.getByRole("button", { name: "General", exact: true })
			.click();
	}

	inviteForm(): Locator {
		return this.page.getByRole("form", { name: "Invite a member" });
	}

	async invite(email: string): Promise<void> {
		await this.inviteForm().getByLabel("Email address").fill(email);
		await this.inviteForm()
			.getByRole("button", { name: "Send invitation" })
			.click();
	}

	inviteFieldError(): Locator {
		return this.inviteForm().locator("#invite-email-error");
	}

	memberRow(name: string): Locator {
		return this.page.getByRole("row").filter({ hasText: name });
	}

	async changeRole(name: string, role: "Admin" | "Member"): Promise<void> {
		const row = this.memberRow(name);
		await row
			.getByRole("button", { name: /admin|member/i })
			.first()
			.click();
		await this.page.getByRole("option", { name: role }).click();
	}

	async removeMember(name: string): Promise<void> {
		await this.memberRow(name)
			.getByRole("button", { name: /actions/i })
			.click();
		await this.page.getByRole("menuitem", { name: /remove member/i }).click();
		await this.page.getByRole("button", { name: /remove member/i }).click();
	}

	organizationName(): Locator {
		return this.page.getByRole("heading", { name: "Organization profile" });
	}

	async updateProfile(input: { name?: string; slug?: string }): Promise<void> {
		await this.page.getByRole("button", { name: /update profile/i }).click();
		if (input.name) {
			await this.page.getByLabel("Name", { exact: true }).fill(input.name);
		}
		if (input.slug) {
			await this.page.getByLabel("Slug").fill(input.slug);
		}
		await this.page.getByRole("button", { name: "Save" }).click();
	}

	async leave(): Promise<void> {
		await this.page
			.getByRole("button", { name: /leave organization/i })
			.click();
	}
}
