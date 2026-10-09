import { describe, expect, it } from "vitest";
import { buildViolation, CONTRAST_MINIMUM } from "@/testing/finding-fixtures";
import { groupViolations } from "./group-violations";

const ABOUT_URL = "https://www.example.org/about";

const homeAlt = buildViolation({ id: "home-alt", severity: "moderate" });
const aboutAlt = buildViolation({
	id: "about-alt",
	pageUrl: ABOUT_URL,
	severity: "minor",
});
const aboutContrast = buildViolation({
	id: "about-contrast",
	criteria: [CONTRAST_MINIMUM],
	level: "AA",
	pageUrl: ABOUT_URL,
	severity: "serious",
});
const violations = [homeAlt, aboutAlt, aboutContrast];

const summarize = (groups: ReturnType<typeof groupViolations>) =>
	groups.map(({ key, label, count }) => ({ key, label, count }));

describe("groupViolations", () => {
	it("groups by criterion with the criterion id and name as label", () => {
		// GIVEN / WHEN
		const groups = groupViolations(violations, "criterion");

		// THEN
		expect(summarize(groups)).toEqual([
			{ key: "1.4.3", label: "1.4.3 Contrast (Minimum)", count: 1 },
			{ key: "1.1.1", label: "1.1.1 Non-text Content", count: 2 },
		]);
	});

	it("groups by page with the page URL as label", () => {
		// GIVEN / WHEN
		const groups = groupViolations(violations, "page");

		// THEN
		expect(summarize(groups)).toEqual([
			{ key: ABOUT_URL, label: ABOUT_URL, count: 2 },
			{
				key: "https://www.example.org/",
				label: "https://www.example.org/",
				count: 1,
			},
		]);
	});

	it("orders groups by their most severe violation", () => {
		// GIVEN / WHEN
		const groups = groupViolations(violations, "page");

		// THEN
		expect(groups.map(({ highestSeverity }) => highestSeverity)).toEqual([
			"serious",
			"moderate",
		]);
	});

	it("orders violations inside a group by severity", () => {
		// GIVEN / WHEN
		const [aboutGroup] = groupViolations(violations, "page");

		// THEN
		expect(aboutGroup?.violations.map(({ id }) => id)).toEqual([
			"about-contrast",
			"about-alt",
		]);
	});

	it("orders groups with equal severity by key", () => {
		// GIVEN
		const later = buildViolation({ id: "b", pageUrl: "https://x.test/b" });
		const earlier = buildViolation({ id: "a", pageUrl: "https://x.test/a" });

		// WHEN
		const groups = groupViolations([later, earlier], "page");

		// THEN
		expect(groups.map(({ key }) => key)).toEqual([
			"https://x.test/a",
			"https://x.test/b",
		]);
	});

	it("returns no groups for an empty list", () => {
		// GIVEN / WHEN
		const groups = groupViolations([], "criterion");

		// THEN
		expect(groups).toEqual([]);
	});
});
