import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ViolationsSection } from "./violations-section";

describe("ViolationsSection for a clean report", () => {
	it("says no automated violations were found", () => {
		// GIVEN / WHEN
		render(<ViolationsSection violations={[]} />);

		// THEN
		expect(screen.getByRole("region", { name: "Violations" }).textContent).toBe(
			"ViolationsNo automated violations were found.",
		);
	});

	it("does not offer filters", () => {
		// GIVEN / WHEN
		render(<ViolationsSection violations={[]} />);

		// THEN
		expect(screen.queryByLabelText("Severity")).toBeNull();
	});
});
