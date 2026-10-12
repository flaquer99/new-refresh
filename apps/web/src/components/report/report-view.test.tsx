import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { ReportView } from "./report-view";

describe("ReportView", () => {
	it("shows the disclaimer for a report with zero violations", () => {
		// GIVEN
		const report = buildReport({ violations: [] });

		// WHEN
		render(<ReportView report={report} />);

		// THEN
		expect(screen.getByRole("note").textContent).toContain(
			"Automated testing cannot prove WCAG conformance",
		);
	});

	it("presents the sections in reading order under a focused report heading", () => {
		// GIVEN / WHEN
		render(<ReportView report={buildReport()} />);

		// THEN
		const headings = screen.getAllByRole("heading", { level: 2 });
		expect(headings.map(({ textContent }) => textContent)).toEqual([
			`Report for ${START_URL}`,
			"Summary",
			"About this report",
			"Violations",
			"Needs review",
			"Page coverage",
		]);
		expect(document.activeElement).toBe(headings[0]);
	});

	it("offers a new scan as a plain link to the form", () => {
		// GIVEN / WHEN
		render(<ReportView report={buildReport()} />);

		// THEN
		expect(
			screen.getByRole("link", { name: "New scan" }).getAttribute("href"),
		).toBe("/");
	});

	it("does not ask for confirmation before a new scan", () => {
		// GIVEN / WHEN
		render(<ReportView report={buildReport()} />);

		// THEN
		expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
	});
});
