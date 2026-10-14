import type { Locator, Page } from "@playwright/test";

export const ONE_ORGANIZATION_HEADING = "Invitation can't be accepted";
export const ONE_ORGANIZATION_TEXT =
	/A person can only belong to one organization/;

export const oneOrganizationNotice = (page: Page): Locator =>
	page.getByRole("heading", { name: ONE_ORGANIZATION_HEADING });
