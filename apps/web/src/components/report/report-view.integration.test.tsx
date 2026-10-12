import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { buildViolation } from "@/testing/finding-fixtures";
import { buildReport } from "@/testing/report-fixtures";
import { ReportView } from "./report-view";

const report = buildReport({
	manualChecks: [],
	reviewItems: [],
	violations: [
		buildViolation({ id: "a", severity: "critical" }),
		buildViolation({ id: "b", severity: "minor" }),
	],
});

describe("ReportView with real filters and cards", () => {
	it("updates the cards and the result count when a filter changes", async () => {
		// GIVEN
		render(<ReportView report={report} />);
		const user = userEvent.setup();

		// WHEN
		await user.selectOptions(screen.getByLabelText("Severity"), "minor");

		// THEN
		expect(screen.getByRole("status").textContent).toBe(
			"Showing 1 of 2 violations",
		);
		expect(screen.getAllByRole("article")).toHaveLength(1);
	});

	it("keeps the severity text label on the filtered card", async () => {
		// GIVEN
		render(<ReportView report={report} />);
		const user = userEvent.setup();

		// WHEN
		await user.selectOptions(screen.getByLabelText("Severity"), "minor");

		// THEN
		expect(screen.getByRole("article").textContent).toContain(
			"Severity: Minor",
		);
	});
});
