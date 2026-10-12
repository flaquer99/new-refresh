import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeleteScanButton } from "@/components/history/delete-scan-button";
import { HistoryAnnouncer } from "@/components/history/history-announcer";

export const DELETE_SCAN_ID = "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11";
export const DELETE_START_URL = "https://www.example.org/";
export const DELETE_TRIGGER_NAME = `Delete scan of ${DELETE_START_URL}`;
export const HISTORY_HEADING_ID = "history-heading";

export const renderDeleteButton = () => {
	render(
		<HistoryAnnouncer focusTargetId={HISTORY_HEADING_ID}>
			<h1 id={HISTORY_HEADING_ID} tabIndex={-1}>
				Scan history
			</h1>
			<DeleteScanButton scanId={DELETE_SCAN_ID} startUrl={DELETE_START_URL} />
		</HistoryAnnouncer>,
	);
	return userEvent.setup();
};

export const openDeleteDialog = async () => {
	const user = renderDeleteButton();
	await user.click(screen.getByRole("button", { name: DELETE_TRIGGER_NAME }));
	return user;
};
