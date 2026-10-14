import { OnboardingPage, SignInPage, SignUpPage } from "./support/auth-pages";
import {
	deleteOrganizationByName,
	deleteUser,
	deleteUserByEmail,
} from "./support/clerk-cleanup";
import { E2E_USER_PASSWORD } from "./support/clerk-env";
import { createTestUser, testEmail, uniqueSuffix } from "./support/clerk-users";
import { SiteHeaderControls } from "./support/header";
import { OrganizationPage } from "./support/organization-page";
import { signInAs } from "./support/sign-in";
import { expect, test } from "./support/test";

test.use({ actor: "visitor" });

test.describe("E2E-01 — a visitor signs up and verifies the email", () => {
	test("lands on onboarding without asking for a phone number", async ({
		page,
	}) => {
		// GIVEN
		const email = testEmail("signup");
		const signUp = new SignUpPage(page);
		await signUp.open();
		await expect(page.getByLabel(/phone/i)).toHaveCount(0);

		// WHEN
		await signUp.fillAndSubmit({
			firstName: "E2E",
			lastName: "Newcomer",
			email,
		});
		await signUp.verifyEmail();

		// THEN
		await expect(page).toHaveURL(/\/onboarding/);
		await deleteUserByEmail(email);
	});
});

test.describe("E2E-02 — a new user creates an organization", () => {
	test("becomes admin and sees the organization in the header", async ({
		page,
	}) => {
		// GIVEN
		const user = await createTestUser("founder", "Founder");
		const organizationName = `E2E Founded ${uniqueSuffix()}`;
		await signInAs(page, user);
		const onboarding = new OnboardingPage(page);
		await onboarding.open();

		// WHEN
		await onboarding.createOrganization(organizationName);

		// THEN
		const header = new SiteHeaderControls(page);
		await expect(header.organizationBadge(organizationName)).toBeVisible();
		const organization = new OrganizationPage(page);
		await organization.open();
		await expect(organization.inviteForm()).toBeVisible();
		await deleteOrganizationByName(organizationName);
		await deleteUser(user.id);
	});
});

test.describe("E2E-03 — a wrong password is announced", () => {
	test("shows an error linked to the password field", async ({
		page,
		world,
	}) => {
		// GIVEN
		const signIn = new SignInPage(page);
		await signIn.open();

		// WHEN
		await signIn.signIn(world.admin.email, `${E2E_USER_PASSWORD}-wrong`);

		// THEN
		const field = page.getByLabel("Password", { exact: true });
		await expect(field).toHaveAttribute("aria-invalid", "true");
		await expect(signIn.passwordError()).toBeVisible();
	});
});
