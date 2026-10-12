import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import {
	openDeleteDialog as openDialog,
	DELETE_START_URL as START_URL,
} from "@/testing/delete-button";

vi.mock("@/app/scans/actions", () => ({ deleteScanAction: vi.fn() }));

const confirm = (user: Awaited<ReturnType<typeof openDialog>>) =>
	user.click(screen.getByRole("button", { name: "Delete scan" }));

describe("DeleteScanButton confirmation", () => {
	it("announces the deletion politely", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({ ok: true });
		const user = await openDialog();

		// WHEN
		await confirm(user);

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
		await confirm(user);

		// THEN
		await waitFor(() =>
			expect(document.activeElement?.id).toBe("history-heading"),
		);
	});

	it("closes the dialog after a successful delete", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({ ok: true });
		const user = await openDialog();

		// WHEN
		await confirm(user);

		// THEN
		await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
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
		await confirm(user);

		// THEN
		expect((await screen.findByRole("alert")).textContent).toBe(message);
	});

	it("keeps the dialog open when the deletion was refused", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({
			ok: false,
			error: { code: "SCAN_STILL_RUNNING", message: "Still running." },
		});
		const user = await openDialog();

		// WHEN
		await confirm(user);

		// THEN
		await screen.findByRole("alert");
		expect(screen.queryByRole("alertdialog")).not.toBeNull();
	});
});
