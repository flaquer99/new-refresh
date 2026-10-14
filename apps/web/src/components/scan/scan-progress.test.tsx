import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ScanProgress } from "./scan-progress";

const PROGRESS = {
	pagesScanned: 3,
	pagesDiscovered: 11,
	currentUrl: "https://www.example.org/about",
};

describe("ScanProgress", () => {
	it("announces the counts and the current URL in a polite live region", () => {
		// GIVEN / WHEN
		render(<ScanProgress canCancel onCancel={vi.fn()} progress={PROGRESS} />);

		// THEN
		const output = screen.getByRole("status");
		expect(output.getAttribute("aria-live")).toBe("polite");
		expect(output.textContent).toContain("3 of 11 discovered pages scanned");
		expect(output.textContent).toContain("https://www.example.org/about");
	});

	it("gives the progress bar its value as text", () => {
		// GIVEN / WHEN
		render(<ScanProgress canCancel onCancel={vi.fn()} progress={PROGRESS} />);

		// THEN
		const bar = screen.getByRole("progressbar", { name: "Pages scanned" });
		expect(bar.textContent).toContain("3 / 11");
	});

	it("tells the user the scan is preparing before the first page starts", () => {
		// GIVEN / WHEN
		render(
			<ScanProgress
				canCancel
				onCancel={vi.fn()}
				progress={{ ...PROGRESS, currentUrl: null }}
			/>,
		);

		// THEN
		expect(screen.getByRole("status").textContent).toContain(
			"Preparing the scan…",
		);
	});

	it("moves focus to the progress heading when it appears", () => {
		// GIVEN / WHEN
		render(<ScanProgress canCancel onCancel={vi.fn()} progress={PROGRESS} />);

		// THEN
		expect(document.activeElement).toBe(
			screen.getByRole("heading", { level: 2 }),
		);
	});

	it("asks to cancel once when the cancel button is pressed", async () => {
		// GIVEN
		const onCancel = vi.fn();
		const user = userEvent.setup();
		render(<ScanProgress canCancel onCancel={onCancel} progress={PROGRESS} />);

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel scan" }));

		// THEN
		expect(onCancel).toHaveBeenCalledTimes(1);
	});

	it("disables the button and shows that cancellation is in progress", async () => {
		// GIVEN
		const user = userEvent.setup();
		const onCancel = vi.fn().mockResolvedValue(true);
		render(<ScanProgress canCancel onCancel={onCancel} progress={PROGRESS} />);

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel scan" }));

		// THEN
		const button = screen.getByRole<HTMLButtonElement>("button", {
			name: "Cancelling…",
		});
		expect(button.disabled).toBe(true);
	});

	it("hides the cancel button when the viewer cannot manage the scan", () => {
		// GIVEN / WHEN
		render(
			<ScanProgress canCancel={false} onCancel={vi.fn()} progress={PROGRESS} />,
		);

		// THEN
		expect(screen.queryByRole("button", { name: "Cancel scan" })).toBeNull();
	});
});
