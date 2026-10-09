import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { buildViolation, CONTRAST_MINIMUM } from "@/testing/finding-fixtures";
import { useReportFilters } from "./use-report-filters";

const ABOUT_URL = "https://www.example.org/about";
const violations = [
	buildViolation({ id: "alt", severity: "critical" }),
	buildViolation({
		id: "contrast",
		criteria: [CONTRAST_MINIMUM],
		level: "AA",
		pageUrl: ABOUT_URL,
		severity: "serious",
	}),
];

describe("useReportFilters", () => {
	it("groups every violation by criterion by default", () => {
		// GIVEN / WHEN
		const { result } = renderHook(() => useReportFilters(violations));

		// THEN
		expect(result.current.groupBy).toBe("criterion");
		expect(result.current.groups.map(({ key }) => key)).toEqual([
			"1.1.1",
			"1.4.3",
		]);
	});

	it("shows only the violations that match a filter", () => {
		// GIVEN
		const { result } = renderHook(() => useReportFilters(violations));

		// WHEN
		act(() => {
			result.current.setFilter("severity", "serious");
		});

		// THEN
		expect(result.current.visibleCount).toBe(1);
		expect(result.current.groups.map(({ key }) => key)).toEqual(["1.4.3"]);
	});

	it("regroups the violations by page", () => {
		// GIVEN
		const { result } = renderHook(() => useReportFilters(violations));

		// WHEN
		act(() => {
			result.current.setGroupBy("page");
		});

		// THEN
		expect(result.current.groups.map(({ key }) => key)).toEqual([
			"https://www.example.org/",
			ABOUT_URL,
		]);
	});
});
