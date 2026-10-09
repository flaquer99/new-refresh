import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { START_URL } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { ReportView } from "./report-view";

describe("ReportView", () => {
	it("shows the disclaimer for a report with zero violations", () => {
		// GIVEN
		const report = buildReport({ violations: [] });

		// WHEN
		render(<ReportView onNewScan={vi.fn()} report={report} />);

		// THEN
		expect(screen.getByRole("note").textContent).toContain(
			"Automated testing cannot prove WCAG conformance",
		);
	});

	it("presents the sections in reading order under a focused report heading", () => {
		// GIVEN / WHEN
		render(<ReportView onNewScan={vi.fn()} report={buildReport()} />);

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

	it("starts a new scan after confirmation", async () => {
		// GIVEN
		const onNewScan = vi.fn();
		const user = userEvent.setup();
		render(<ReportView onNewScan={onNewScan} report={buildReport()} />);

		// WHEN
		await user.click(screen.getByRole("button", { name: "New scan" }));
		await user.click(screen.getByRole("button", { name: "Start a new scan" }));

		// THEN
		expect(onNewScan).toHaveBeenCalledTimes(1);
	});
});
