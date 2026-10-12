import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { deleteScanAction } from "@/app/scans/actions";
import { buildHistoryEntry, HISTORY_NOW } from "@/testing/history-fixtures";
import { HistoryAnnouncer } from "./history-announcer";
import { ScanHistoryList } from "./scan-history-list";

vi.mock("@/app/scans/actions", () => ({ deleteScanAction: vi.fn() }));

const FIRST_URL = "https://first.example.org/";
const SECOND_URL = "https://second.example.org/";

const renderList = () => {
	const entries = [
		buildHistoryEntry({
			scanId: "11111111-1111-4111-8111-111111111111",
			startUrl: FIRST_URL,
		}),
		buildHistoryEntry({
			scanId: "22222222-2222-4222-8222-222222222222",
			startUrl: SECOND_URL,
		}),
	];
	render(
		<HistoryAnnouncer focusTargetId="history-heading">
			<h1 id="history-heading" tabIndex={-1}>
				Scan history
			</h1>
			<ScanHistoryList
				entries={entries}
				labelledBy="history-heading"
				now={HISTORY_NOW}
			/>
		</HistoryAnnouncer>,
	);
	return userEvent.setup();
};

describe("Delete flow in the history list", () => {
	it("moves focus to the next entry after confirming", async () => {
		// GIVEN
		vi.mocked(deleteScanAction).mockResolvedValue({ ok: true });
		const user = renderList();
		await user.click(
			screen.getByRole("button", { name: `Delete scan of ${FIRST_URL}` }),
		);

		// WHEN
		await user.click(screen.getByRole("button", { name: "Delete scan" }));

		// THEN
		await waitFor(() =>
			expect(document.activeElement?.textContent).toBe(SECOND_URL),
		);
	});
});
