import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright";
import type { Page } from "@playwright/test";
import type { TestUser } from "./clerk-users";

type ClerkWindow = {
	Clerk: { setActive: (params: { organization: string }) => Promise<void> };
};

export const signInAs = async (page: Page, user: TestUser): Promise<void> => {
	await setupClerkTestingToken({ page });
	await page.goto("/");
	await clerk.signIn({ page, emailAddress: user.email });
	if (user.organizationId) {
		await page.evaluate(
			(organization) =>
				(window as unknown as ClerkWindow).Clerk.setActive({ organization }),
			user.organizationId,
		);
	}
};
