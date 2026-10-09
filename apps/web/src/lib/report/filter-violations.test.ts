import { describe, expect, it } from "vitest";
import { buildViolation, CONTRAST_MINIMUM } from "@/testing/finding-fixtures";
import { ALL_VIOLATIONS, filterViolations } from "./filter-violations";

const missingAlt = buildViolation({ id: "alt", severity: "critical" });
const lowContrast = buildViolation({
	id: "contrast",
	criteria: [CONTRAST_MINIMUM],
	level: "AA",
	severity: "serious",
	viewports: ["desktop"],
});
const smallTarget = buildViolation({
	id: "target",
	level: "AA",
	severity: "moderate",
	viewports: ["mobile"],
});
const violations = [missingAlt, lowContrast, smallTarget];

const idsOf = (list: { id: string }[]): string[] => list.map(({ id }) => id);

describe("filterViolations", () => {
	it("returns every violation when no filter is applied", () => {
		// GIVEN / WHEN
		const result = filterViolations(violations, ALL_VIOLATIONS);

		// THEN
		expect(idsOf(result)).toEqual(["alt", "contrast", "target"]);
	});

	it("keeps only violations with the selected severity", () => {
		// GIVEN
		const filters = { ...ALL_VIOLATIONS, severity: "serious" } as const;

		// WHEN
		const result = filterViolations(violations, filters);

		// THEN
		expect(idsOf(result)).toEqual(["contrast"]);
	});

	it("keeps only violations with the selected level", () => {
		// GIVEN
		const filters = { ...ALL_VIOLATIONS, level: "AA" } as const;

		// WHEN
		const result = filterViolations(violations, filters);

		// THEN
		expect(idsOf(result)).toEqual(["contrast", "target"]);
	});

	it("keeps violations that occur at the selected viewport", () => {
		// GIVEN
		const filters = { ...ALL_VIOLATIONS, viewport: "mobile" } as const;

		// WHEN
		const result = filterViolations(violations, filters);

		// THEN
		expect(idsOf(result)).toEqual(["alt", "target"]);
	});

	it("combines filters so a violation must match all of them", () => {
		// GIVEN
		const filters = {
			severity: "moderate",
			level: "AA",
			viewport: "desktop",
		} as const;

		// WHEN
		const result = filterViolations(violations, filters);

		// THEN
		expect(result).toEqual([]);
	});
});
