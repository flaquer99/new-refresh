import { SignInPage } from "./support/auth-pages";
import { E2E_USER_PASSWORD } from "./support/clerk-env";
import { SiteHeaderControls } from "./support/header";
import { fixtureUrl } from "./support/ports";
import { completeScanAs } from "./support/scan-as";
import { expect, test } from "./support/test";

const HTTP_UNAUTHORIZED = 401;
const SIGN_IN_URL = /\/sign-in/;

test.describe("E2E-04 — a signed-out deep link returns after sign-in", () => {
	test.use({ actor: "visitor" });

	test("opens the scan report once the owner signs in", async ({
		page,
		browser,
		baseURL,
		world,
	}) => {
		// GIVEN
		const scanId = await completeScanAs({
			browser,
			baseURL,
			user: world.admin,
			url: fixtureUrl("/clean/?deeplink=1"),
		});
		await page.goto(`/scans/${scanId}`);
		await expect(page).toHaveURL(SIGN_IN_URL);

		// WHEN
		await new SignInPage(page).signIn(world.admin.email, E2E_USER_PASSWORD);

		// THEN
		await expect(page).toHaveURL(new RegExp(`/scans/${scanId}$`));
		await expect(
			page.getByRole("heading", { name: /^Report for / }),
		).toBeVisible();
	});
});

test.describe("E2E-05 — signed-out visitors cannot reach scans", () => {
	test.use({ actor: "visitor" });

	test("redirects the history page to sign-in", async ({ page }) => {
		// WHEN
		await page.goto("/scans");

		// THEN
		await expect(page).toHaveURL(SIGN_IN_URL);
	});

	test("answers 401 on the scan API", async ({ page }) => {
		// WHEN
		const response = await page.request.post("/api/scans", {
			data: { url: fixtureUrl("/clean/"), depth: 0 },
		});

		// THEN
		expect(response.status()).toBe(HTTP_UNAUTHORIZED);
	});
});

test.describe("E2E-17 — signing out returns to the landing view", () => {
	test("shows Sign in and Sign up after signing out", async ({ page }) => {
		// GIVEN
		const header = new SiteHeaderControls(page);
		await page.goto("/");

		// WHEN
		await header.signOut();

		// THEN
		await expect(header.signInButton()).toBeVisible();
		await expect(header.signUpButton()).toBeVisible();
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"Find WCAG 2.2 issues",
		);
	});
});
