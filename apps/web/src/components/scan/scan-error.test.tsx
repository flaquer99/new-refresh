import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScanErrorView } from "./scan-error";

const ERROR = {
	code: "SITE_UNREACHABLE",
	message:
		"We couldn't reach www.example.invalid. Check the address and try again.",
} as const;

describe("ScanErrorView", () => {
	it("announces the error message", () => {
		// GIVEN / WHEN
		render(<ScanErrorView error={ERROR} onBack={vi.fn()} />);

		// THEN
		expect(screen.getByRole("alert").textContent).toBe(ERROR.message);
	});

	it("returns to the form with the back button", async () => {
		// GIVEN
		const onBack = vi.fn();
		const user = userEvent.setup();
		render(<ScanErrorView error={ERROR} onBack={onBack} />);

		// WHEN
		await user.click(screen.getByRole("button", { name: "Back to form" }));

		// THEN
		expect(onBack).toHaveBeenCalledTimes(1);
	});
});
