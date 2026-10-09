import { describe, expect, it } from "vitest";
import { compareSeverity, highestSeverity, SEVERITY_LABELS } from "./severity";

describe("severity helpers", () => {
	it("labels each severity with a capitalised word", () => {
		// GIVEN / WHEN
		const labels = Object.values(SEVERITY_LABELS);

		// THEN
		expect(labels).toEqual(["Critical", "Serious", "Moderate", "Minor"]);
	});

	it("orders more severe values first", () => {
		// GIVEN
		const severities = ["minor", "critical", "moderate", "serious"] as const;

		// WHEN
		const sorted = [...severities].sort(compareSeverity);

		// THEN
		expect(sorted).toEqual(["critical", "serious", "moderate", "minor"]);
	});

	it("finds the most severe value in a list", () => {
		// GIVEN / WHEN
		const highest = highestSeverity(["minor", "serious", "moderate"]);

		// THEN
		expect(highest).toBe("serious");
	});

	it("falls back to minor for an empty list", () => {
		// GIVEN / WHEN
		const highest = highestSeverity([]);

		// THEN
		expect(highest).toBe("minor");
	});
});
