import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import {
	openDeleteDialog as openDialog,
	DELETE_START_URL as START_URL,
	DELETE_TRIGGER_NAME as TRIGGER_NAME,
} from "@/testing/delete-button";

vi.mock("@/app/scans/actions", () => ({ deleteScanAction: vi.fn() }));

describe("DeleteScanButton", () => {
	it("opens an alertdialog named Delete this scan?", async () => {
		// WHEN
		await openDialog();

		// THEN
		expect(
			screen.getAllByRole("alertdialog", { name: "Delete this scan?" }),
		).toHaveLength(1);
	});

	it("describes the dialog with the start url", async () => {
		// WHEN
		await openDialog();

		// THEN
		expect(screen.getByRole("alertdialog").textContent).toContain(START_URL);
	});

	it("puts focus on Cancel when the confirmation opens", async () => {
		// WHEN
		await openDialog();

		// THEN
		await waitFor(() =>
			expect(document.activeElement?.textContent).toBe("Cancel"),
		);
	});

	it("returns focus to Delete when cancelled", async () => {
		// GIVEN
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel" }));

		// THEN
		await waitFor(() =>
			expect(document.activeElement?.getAttribute("aria-label")).toBe(
				TRIGGER_NAME,
			),
		);
	});

	it("deletes nothing when cancelled", async () => {
		// GIVEN
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel" }));

		// THEN
		expect(deleteScanAction).not.toHaveBeenCalled();
	});

	it("closes the dialog on Escape", async () => {
		// GIVEN
		const user = await openDialog();

		// WHEN
		await user.keyboard("{Escape}");

		// THEN
		await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
	});

	it("returns focus to Delete on Escape", async () => {
		// GIVEN
		const user = await openDialog();

		// WHEN
		await user.keyboard("{Escape}");

		// THEN
		await waitFor(() =>
			expect(document.activeElement?.getAttribute("aria-label")).toBe(
				TRIGGER_NAME,
			),
		);
	});
});
