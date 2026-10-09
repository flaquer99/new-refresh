import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { ReportSummary } from "./report-summary";

const report = buildReport({
	depth: 2,
	outcome: "page-limit-reached",
	summary: {
		pagesScanned: 50,
		pagesSkipped: 3,
		pagesFailed: 1,
		totalViolations: 7,
		violationsBySeverity: { critical: 1, serious: 2, moderate: 3, minor: 1 },
		violationsByLevel: { A: 4, AA: 3 },
		needsReviewCount: 9,
	},
});

const summaryValue = (term: string): string | null | undefined =>
	screen.getByText(term, { selector: "dt" }).nextElementSibling?.textContent;

describe("ReportSummary", () => {
	it("shows the submitted URL and depth", () => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue("Website")).toBe(START_URL);
		expect(summaryValue("Depth")).toBe("2");
	});

	it("states whether the scan was complete, partial, or limited", () => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue("Result")).toBe("Limited — page limit reached");
	});

	it("shows page counts by status", () => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue("Pages scanned")).toBe("50");
		expect(summaryValue("Pages skipped")).toBe("3");
		expect(summaryValue("Pages failed")).toBe("1");
	});

	it("shows the total number of violations", () => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue("Violations")).toBe("7");
	});

	it.each([
		["Critical", "1"],
		["Serious", "2"],
		["Moderate", "3"],
		["Minor", "1"],
	])("shows the %s violation count", (term, count) => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue(term)).toBe(count);
	});

	it.each([
		["Level A", "4"],
		["Level AA", "3"],
	])("shows the %s violation count", (term, count) => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue(term)).toBe(count);
	});

	it("shows the number of items that need review", () => {
		// GIVEN / WHEN
		render(<ReportSummary report={report} />);

		// THEN
		expect(summaryValue("Needs review")).toBe("9");
	});
});
