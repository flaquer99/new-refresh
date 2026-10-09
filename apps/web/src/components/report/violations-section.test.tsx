import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
	buildViolation,
	CONTRAST_MINIMUM,
	START_URL,
} from "@/testing/finding-fixtures";
import { ViolationsSection } from "./violations-section";

const ABOUT_URL = "https://www.example.org/about";
const violations = [
	buildViolation({ id: "home-alt", severity: "critical" }),
	buildViolation({ id: "about-alt", pageUrl: ABOUT_URL, severity: "minor" }),
	buildViolation({
		id: "about-contrast",
		criteria: [CONTRAST_MINIMUM],
		level: "AA",
		pageUrl: ABOUT_URL,
		severity: "serious",
		viewports: ["desktop"],
	}),
];

const groupHeadings = (): string[] =>
	screen
		.getAllByRole("heading", { level: 3 })
		.map(({ textContent }) => textContent ?? "");

const violationsRegion = (): HTMLElement =>
	screen.getByRole("region", { name: "Violations" });

const setup = () => {
	render(<ViolationsSection violations={violations} />);
	return userEvent.setup();
};

describe("ViolationsSection", () => {
	it("groups violations by success criterion by default, with counts", () => {
		// GIVEN / WHEN
		setup();

		// THEN
		expect(groupHeadings()).toEqual([
			"1.1.1 Non-text Content (2)",
			"1.4.3 Contrast (Minimum) (1)",
		]);
	});

	it("shows only matching violations when filtered", async () => {
		// GIVEN
		const user = setup();

		// WHEN
		await user.selectOptions(screen.getByLabelText("Severity"), "serious");

		// THEN
		expect(groupHeadings()).toEqual(["1.4.3 Contrast (Minimum) (1)"]);
	});

	it("updates the visible count when filtered", async () => {
		// GIVEN
		const user = setup();

		// WHEN
		await user.selectOptions(screen.getByLabelText("Severity"), "serious");

		// THEN
		expect(screen.getByRole("status").textContent).toBe(
			"Showing 1 of 3 violations",
		);
	});

	it("groups violations by page when chosen", async () => {
		// GIVEN
		const user = setup();

		// WHEN
		await user.selectOptions(screen.getByLabelText("Group by"), "page");

		// THEN
		expect(groupHeadings()).toEqual([`${START_URL} (1)`, `${ABOUT_URL} (2)`]);
	});

	it("replaces the violation list with an explanation when nothing matches", async () => {
		// GIVEN
		const user = setup();
		await user.selectOptions(screen.getByLabelText("Level"), "AA");

		// WHEN
		await user.selectOptions(screen.getByLabelText("Viewport"), "mobile");

		// THEN
		expect({
			cards: screen.queryAllByRole("article").length,
			last: violationsRegion().lastElementChild?.textContent,
		}).toEqual({ cards: 0, last: "No violations match the selected filters." });
	});
});
