import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { NewScanDialog } from "./new-scan-dialog";

const setup = async () => {
	const onConfirm = vi.fn();
	const user = userEvent.setup();
	render(<NewScanDialog onConfirm={onConfirm} />);
	await user.click(screen.getByRole("button", { name: "New scan" }));
	return { onConfirm, user, dialog: screen.getByRole("dialog") };
};

describe("NewScanDialog", () => {
	it("asks for confirmation in a modal dialog", async () => {
		// GIVEN / WHEN
		const { dialog } = await setup();

		// THEN
		expect(dialog.hasAttribute("open")).toBe(true);
		expect(dialog.textContent).toContain("This report will be lost");
	});

	it("starts a new scan once confirmed", async () => {
		// GIVEN
		const { onConfirm, user } = await setup();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Start a new scan" }));

		// THEN
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});

	it("keeps the report when the user backs out", async () => {
		// GIVEN
		const { onConfirm, user, dialog } = await setup();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Keep this report" }));

		// THEN
		expect(dialog.hasAttribute("open")).toBe(false);
		expect(onConfirm).not.toHaveBeenCalled();
	});
});
