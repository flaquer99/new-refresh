import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
	DEPTH_LABEL,
	renderScanForm,
	URL_LABEL,
} from "@/testing/render-scan-form";

describe("ScanForm", () => {
	it("submits the trimmed URL and the chosen depth", async () => {
		// GIVEN
		const { onSubmit, user } = renderScanForm();
		await user.type(
			screen.getByLabelText(URL_LABEL),
			"  https://www.example.org/ ",
		);
		await user.selectOptions(screen.getByLabelText(DEPTH_LABEL), "2");

		// WHEN
		await user.click(screen.getByRole("button", { name: "Scan" }));

		// THEN
		expect(onSubmit).toHaveBeenCalledWith({
			url: "https://www.example.org/",
			depth: 2,
		});
	});

	it("prefills the URL and depth from an earlier request", () => {
		// GIVEN / WHEN
		renderScanForm({
			initialRequest: { url: "https://www.example.org/", depth: 3 },
		});

		// THEN
		expect({
			url: screen.getByLabelText<HTMLInputElement>(URL_LABEL).value,
			depth: screen.getByLabelText<HTMLSelectElement>(DEPTH_LABEL).value,
		}).toEqual({ url: "https://www.example.org/", depth: "3" });
	});

	it("moves focus to the URL field when an empty form is submitted", async () => {
		// GIVEN
		const { user } = renderScanForm();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Scan" }));

		// THEN
		expect(document.activeElement).toBe(screen.getByLabelText(URL_LABEL));
	});

	it("disables the scan button while the scan is starting", () => {
		// GIVEN / WHEN
		renderScanForm({ isStarting: true });

		// THEN
		const button = screen.getByRole<HTMLButtonElement>("button", {
			name: "Starting scan…",
		});
		expect(button.disabled).toBe(true);
	});
});
