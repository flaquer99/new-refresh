import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { INVALID_URL, submitInvalidUrl } from "@/testing/render-scan-form";

describe("ScanForm with an invalid URL", () => {
	it("shows the inline error message", async () => {
		// GIVEN / WHEN
		await submitInvalidUrl();

		// THEN
		expect(screen.getByRole("alert").textContent).toBe(INVALID_URL);
	});

	it("marks the URL field as invalid", async () => {
		// GIVEN / WHEN
		const { input } = await submitInvalidUrl();

		// THEN
		expect(input.getAttribute("aria-invalid")).toBe("true");
	});

	it("links the error message to the URL field", async () => {
		// GIVEN / WHEN
		const { input } = await submitInvalidUrl();

		// THEN
		expect(input.getAttribute("aria-describedby")).toContain(
			screen.getByRole("alert").id,
		);
	});

	it("does not submit the form", async () => {
		// GIVEN / WHEN
		const { onSubmit } = await submitInvalidUrl();

		// THEN
		expect(onSubmit).not.toHaveBeenCalled();
	});
});
