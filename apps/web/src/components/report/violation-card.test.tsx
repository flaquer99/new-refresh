import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildViolation, NON_TEXT_CONTENT } from "@/testing/finding-fixtures";
import { ViolationCard } from "./violation-card";

const violation = buildViolation();

const renderCard = () => {
	render(<ViolationCard violation={violation} />);
	return screen.getByRole("article");
};

describe("ViolationCard", () => {
	it("titles the card with the problem description", () => {
		// GIVEN / WHEN
		renderCard();

		// THEN
		expect(screen.getByRole("heading", { level: 4 }).textContent).toBe(
			"Images must have alternative text",
		);
	});

	it("shows the criterion number, name, and level", () => {
		// GIVEN / WHEN
		const card = renderCard();

		// THEN
		expect(card.textContent).toContain("1.1.1 Non-text Content");
		expect(card.textContent).toContain("Level A");
	});

	it("labels the severity with text, not only color", () => {
		// GIVEN / WHEN
		const card = renderCard();

		// THEN
		expect(card.textContent).toContain("Severity: Critical");
	});

	it("shows where the problem is: page, selector, and HTML snippet", () => {
		// GIVEN / WHEN
		const card = renderCard();

		// THEN
		expect(card.textContent).toContain(violation.pageUrl);
		expect(card.textContent).toContain(violation.selector);
		expect(card.textContent).toContain(violation.html);
	});

	it("lists the viewports where the problem occurs", () => {
		// GIVEN / WHEN
		const card = renderCard();

		// THEN
		expect(card.textContent).toContain("Desktop (1280 px), Mobile (320 px)");
	});

	it("shows the fix guidance", () => {
		// GIVEN / WHEN
		const card = renderCard();

		// THEN
		expect(card.textContent).toContain(violation.fixGuidance);
	});

	it("links to the W3C Understanding document in a new tab with rel noopener", () => {
		// GIVEN / WHEN
		renderCard();

		// THEN
		const link = screen.getByRole("link", { name: /Understanding 1\.1\.1/ });
		expect(link.getAttribute("href")).toBe(NON_TEXT_CONTENT.understandingUrl);
		expect(link.getAttribute("target")).toBe("_blank");
		expect(link.getAttribute("rel")).toContain("noopener");
	});
});
