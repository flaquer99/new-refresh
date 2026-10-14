import { findWcagViolations } from "./support/axe";
import { hasVisibleFocus, tabTo } from "./support/keyboard";
import { OrganizationPage } from "./support/organization-page";
import { type Actor, expect, test } from "./support/test";

const PAGES_BY_ACTOR: ReadonlyArray<{ actor: Actor; paths: string[] }> = [
	{ actor: "visitor", paths: ["/", "/sign-in", "/sign-up"] },
	{ actor: "admin", paths: ["/", "/account", "/organization", "/join"] },
];
const VIEWPORTS = [
	{ width: 1280, height: 800 },
	{ width: 320, height: 640 },
] as const;
const SCHEMES = ["light", "dark"] as const;

for (const { actor, paths } of PAGES_BY_ACTOR) {
	test.describe(`E2E-18 — ${actor} pages pass the app's own checks`, () => {
		test.use({ actor });

		for (const path of paths) {
			for (const viewport of VIEWPORTS) {
				for (const scheme of SCHEMES) {
					test(`has no WCAG A/AA violations on ${path} at ${viewport.width}px in ${scheme}`, async ({
						page,
					}) => {
						// GIVEN
						await page.setViewportSize(viewport);
						await page.emulateMedia({ colorScheme: scheme });

						// WHEN
						await page.goto(path);
						await page.getByRole("main").waitFor();
						const violations = await findWcagViolations(page);

						// THEN
						expect(violations).toEqual([]);
					});
				}
			}
		}
	});
}

test.describe("E2E-18 — the invite form is keyboard operable", () => {
	test("reaches the email field with a visible focus ring", async ({
		page,
	}) => {
		// GIVEN
		await new OrganizationPage(page).open();
		const field = new OrganizationPage(page)
			.inviteForm()
			.getByLabel("Email address");

		// WHEN
		await tabTo(page, field);

		// THEN
		expect(await hasVisibleFocus(field)).toBe(true);
	});
});
