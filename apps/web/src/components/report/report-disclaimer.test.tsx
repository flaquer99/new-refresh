import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ReportDisclaimer } from "./report-disclaimer";

describe("ReportDisclaimer", () => {
	it("explains that automated testing cannot prove conformance", () => {
		// GIVEN / WHEN
		render(<ReportDisclaimer />);

		// THEN
		const note = screen.getByRole("note");
		expect(note.textContent).toContain(
			"Automated testing cannot prove WCAG conformance",
		);
		expect(note.textContent).toContain("must be checked by a person");
	});
});
