import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import { DeleteScanButton } from "./delete-scan-button";
import { HistoryAnnouncer } from "./history-announcer";

vi.mock("@/app/scans/actions", () => ({ deleteScanAction: vi.fn() }));

const SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
const START_URL = "https://www.example.org/";
const TRIGGER_NAME = `Delete scan of ${START_URL}`;

const renderButton = () => {
	render(
		<HistoryAnnouncer focusTargetId="history-heading">
			<h1 id="history-heading" tabIndex={-1}>
				Scan history
			</h1>
			<DeleteScanButton scanId={SCAN_ID} startUrl={START_URL} />
		</HistoryAnnouncer>,
	);
	return userEvent.setup();
};

const openDialog = async () => {
	const user = renderButton();
	await user.click(screen.getByRole("button", { name: TRIGGER_NAME }));
	return user;
};

describe("DeleteScanButton", () => {
	it("opens a confirmation naming the start url with focus on Cancel", async () => {
		// WHEN
		await openDialog();

		// THEN
		expect([
			screen.getByRole("dialog").textContent?.includes(START_URL),
			document.activeElement?.textContent,
		]).toEqual([true, "Cancel"]);
	});

	it("returns focus to Delete and deletes nothing when cancelled", async () => {
		// GIVEN
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Cancel" }));

		// THEN
		expect([
			document.activeElement?.getAttribute("aria-label"),
			vi.mocked(deleteScanAction).mock.calls.length,
		]).toEqual([TRIGGER_NAME, 0]);
	});

	it("announces the deletion and moves focus to the history heading", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({ ok: true });
		const user = await openDialog();

		// WHEN
		await user.click(screen.getByRole("button", { name: "Delete scan" }));

		// THEN
		expect([
			screen.getByRole("status").textContent,
			document.activeElement?.id,
		]).toEqual([`Scan of ${START_URL} deleted.`, "history-heading"]);
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
