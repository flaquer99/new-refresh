import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	ONE_ORGANIZATION_MESSAGE,
	OneOrganizationNotice,
} from "./one-organization-notice";

describe("OneOrganizationNotice", () => {
	it("explains the one-organization limit", () => {
		// GIVEN / WHEN
		render(<OneOrganizationNotice />);

		// THEN
		expect(screen.getByText(ONE_ORGANIZATION_MESSAGE)).toBeTruthy();
	});

	it("links back to the home page", () => {
		// GIVEN / WHEN
		render(<OneOrganizationNotice />);

		// THEN
		expect(
			screen.getByRole("link", { name: "Go to refresh" }).getAttribute("href"),
		).toBe("/");
	});
});
