import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	DEPTH_LABEL,
	INVALID_URL,
	renderScanForm,
	URL_LABEL,
} from "@/testing/render-scan-form";

describe("ScanForm fields", () => {
	it("shows the URL error when leaving the field, without submitting", async () => {
		// GIVEN
		const { user } = renderScanForm();
		await user.type(screen.getByLabelText(URL_LABEL), "example");

		// WHEN
		await user.tab();

		// THEN
		expect(screen.getByRole("alert").textContent).toBe(INVALID_URL);
	});

	it("does not flag an untouched empty field when leaving it", async () => {
		// GIVEN
		const { user } = renderScanForm();
		await user.click(screen.getByLabelText(URL_LABEL));

		// WHEN
		await user.tab();

		// THEN
		expect(screen.queryByRole("alert")).toBeNull();
	});

	it("offers depths 0 to 3 with depth 0 selected by default", () => {
		// GIVEN / WHEN
		renderScanForm();
		const select = screen.getByLabelText<HTMLSelectElement>(DEPTH_LABEL);

		// THEN
		expect(select.value).toBe("0");
		expect([...select.options].map(({ value }) => value)).toEqual([
			"0",
			"1",
			"2",
			"3",
		]);
	});
});
