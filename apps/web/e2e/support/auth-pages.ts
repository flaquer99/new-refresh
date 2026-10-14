import { expect, type Locator, type Page } from "@playwright/test";
import { E2E_USER_PASSWORD, VERIFICATION_CODE } from "./clerk-env";

export type SignUpInput = {
	firstName: string;
	lastName: string;
	email: string;
};

const CONTINUE = { name: "Continue", exact: true } as const;

export class SignInPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(): Promise<void> {
		await this.page.goto("/sign-in");
	}

	async signIn(email: string, password: string): Promise<void> {
		await this.page.getByRole("textbox", { name: /email/i }).fill(email);
		await this.page.getByRole("button", CONTINUE).click();
		await this.page.getByLabel("Password", { exact: true }).fill(password);
		await this.page.getByRole("button", CONTINUE).click();
	}

	passwordError(): Locator {
		return this.page.locator("#error-password, [id^='error-']").first();
	}
}

export class SignUpPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(): Promise<void> {
		await this.page.goto("/sign-up");
	}

	async fillAndSubmit({
		firstName,
		lastName,
		email,
	}: SignUpInput): Promise<void> {
		await this.page.getByLabel("First name").fill(firstName);
		await this.page.getByLabel("Last name").fill(lastName);
		await this.page.getByLabel("Email address").fill(email);
		await this.page
			.getByLabel("Password", { exact: true })
			.fill(E2E_USER_PASSWORD);
		await this.page.getByRole("button", CONTINUE).click();
	}

	async verifyEmail(): Promise<void> {
		await this.page
			.getByLabel(/verification code|digit 1/i)
			.first()
			.click();
		await this.page.keyboard.type(VERIFICATION_CODE);
	}
}

export class OnboardingPage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	async open(): Promise<void> {
		await this.page.goto("/onboarding");
	}

	async createOrganization(name: string): Promise<void> {
		await this.page
			.getByRole("button", { name: /create organization/i })
			.click();
		await this.page.getByLabel("Name", { exact: true }).fill(name);
		await this.page
			.getByRole("button", { name: /create organization/i })
			.last()
			.click();
	}

	async expectChoosingOrganization(): Promise<void> {
		await expect(this.page).toHaveURL(/\/onboarding/);
	}
}
