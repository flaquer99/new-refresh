import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	buildManualCheck,
	buildReviewItem,
	CONTRAST_MINIMUM,
	START_URL,
} from "@/testing/finding-fixtures";
import { NeedsReviewSection } from "./needs-review-section";

const reviewItem = buildReviewItem();
const manualCheck = buildManualCheck({
	scope: "site",
	pages: [START_URL, `${START_URL}about`],
});

const listUnder = (heading: string): HTMLElement => {
	const section = screen
		.getByRole("heading", { name: heading })
		.closest("section");
	if (!section) {
		throw new Error(`No section for heading ${heading}`);
	}
	return section;
};

describe("NeedsReviewSection", () => {
	it("shows each inconclusive automated check with its criterion, element, and guidance", () => {
		// GIVEN / WHEN
		render(<NeedsReviewSection manualChecks={[]} reviewItems={[reviewItem]} />);

		// THEN
		const section = listUnder("Inconclusive automated checks");
		expect(section.textContent).toContain("1.4.3 Contrast (Minimum)");
		expect(section.textContent).toContain(reviewItem.selector);
		expect(section.textContent).toContain(reviewItem.guidance);
	});

	it("shows each manual check with its criterion, scope, pages, and guidance", () => {
		// GIVEN / WHEN
		render(
			<NeedsReviewSection manualChecks={[manualCheck]} reviewItems={[]} />,
		);

		// THEN
		const section = listUnder("Manual checks");
		expect(within(section).getByRole("heading", { level: 4 }).textContent).toBe(
			"1.4.3 Contrast (Minimum)",
		);
		expect(section.textContent).toContain("Applies to the whole site");
		expect(section.textContent).toContain(`${START_URL}about`);
		expect(section.textContent).toContain(manualCheck.guidance);
	});

	it("links a manual check to its Understanding document", () => {
		// GIVEN / WHEN
		render(
			<NeedsReviewSection manualChecks={[manualCheck]} reviewItems={[]} />,
		);

		// THEN
		const link = screen.getByRole("link", { name: /Understanding 1\.4\.3/ });
		expect(link.getAttribute("href")).toBe(CONTRAST_MINIMUM.understandingUrl);
	});

	it("says when there is nothing to review in a list", () => {
		// GIVEN / WHEN
		render(<NeedsReviewSection manualChecks={[]} reviewItems={[]} />);

		// THEN
		expect(listUnder("Inconclusive automated checks").textContent).toContain(
			"None found.",
		);
		expect(listUnder("Manual checks").textContent).toContain("None found.");
	});
});
