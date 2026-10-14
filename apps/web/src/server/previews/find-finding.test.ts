import { describe, expect, it } from "vitest";
import { buildReviewItem, buildViolation } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { findFinding } from "./find-finding";

describe("findFinding", () => {
	it("finds a violation by id", () => {
		// GIVEN
		const violation = buildViolation({ id: "v-1" });
		const report = buildReport({ violations: [violation] });

		// WHEN
		const found = findFinding(report, "v-1");

		// THEN
		expect(found).toEqual(violation);
	});

	it("finds a review item by id", () => {
		// GIVEN
		const reviewItem = buildReviewItem({ id: "r-1" });
		const report = buildReport({ reviewItems: [reviewItem] });

		// WHEN
		const found = findFinding(report, "r-1");

		// THEN
		expect(found).toEqual(reviewItem);
	});

	it("prefers the violation when both lists share an id", () => {
		// GIVEN
		const violation = buildViolation({ id: "same" });
		const report = buildReport({
			violations: [violation],
			reviewItems: [buildReviewItem({ id: "same" })],
		});

		// WHEN
		const found = findFinding(report, "same");

		// THEN
		expect(found).toEqual(violation);
	});

	it("returns null when no finding has the id", () => {
		// GIVEN
		const report = buildReport({ violations: [buildViolation()] });

		// WHEN
		const found = findFinding(report, "missing");

		// THEN
		expect(found).toBeNull();
	});
});
