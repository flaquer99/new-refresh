import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import {
	openDeleteDialog as openDialog,
	DELETE_START_URL as START_URL,
} from "@/testing/delete-button";

vi.mock("@/app/scans/actions", () => ({ deleteScanAction: vi.fn() }));

describe("DeleteScanButton confirmation", () => {
	it("announces the deletion politely", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({ ok: true });
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Delete scan" }));

		// THEN
		expect(screen.getByRole("status").textContent).toBe(
			`Scan of ${START_URL} deleted.`,
		);
	});

	it("moves focus to the history heading when no other entry is left", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({ ok: true });
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Delete scan" }));

		// THEN
		expect(document.activeElement?.id).toBe("history-heading");
	});

	it("shows why the deletion was refused", async () => {
		// GIVEN
		const message =
			"This scan is still running. Cancel it and wait for it to finish before deleting it.";
		vi.mocked(deleteScanAction).mockResolvedValue({
			ok: false,
			error: { code: "SCAN_STILL_RUNNING", message },
		});
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Delete scan" }));

		// THEN
		expect((await screen.findByRole("alert")).textContent).toBe(message);
	});
});
