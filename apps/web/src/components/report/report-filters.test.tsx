import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ReportFilters } from "./report-filters";

const FILTERS = { severity: "all", level: "all", viewport: "all" } as const;

const renderFilters = (onFilterChange = vi.fn()) => {
	render(
		<ReportFilters
			filters={FILTERS}
			groupBy="criterion"
			onFilterChange={onFilterChange}
			onGroupByChange={vi.fn()}
		/>,
	);
	return onFilterChange;
};

describe("ReportFilters", () => {
	it.each(["Group by", "Severity", "Level", "Viewport"])(
		"keeps %s as a labelled native select",
		(label) => {
			// GIVEN / WHEN
			renderFilters();

			// THEN
			const select = screen.getByLabelText(label);
			expect(select.tagName).toBe("SELECT");
		},
	);

	it("keeps the filters inside a named fieldset", () => {
		// GIVEN / WHEN
		renderFilters();

		// THEN
		expect(
			screen.getByRole("group", { name: "Group and filter violations" })
				.tagName,
		).toBe("FIELDSET");
	});

	it("reports a changed filter", async () => {
		// GIVEN
		const onFilterChange = renderFilters();

		// WHEN
		await userEvent
			.setup()
			.selectOptions(screen.getByLabelText("Severity"), "serious");

		// THEN
		expect(onFilterChange).toHaveBeenCalledWith("severity", "serious");
	});
});
