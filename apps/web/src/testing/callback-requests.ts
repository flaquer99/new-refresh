import type { ScanResult } from "@refresh/scan-contracts/scan-result";
import { beforeEach, vi } from "vitest";
import { buildReport } from "./report-fixtures";
import { SCAN_ID } from "./scan-route-requests";

export const CALLBACK_TOKEN = "k".repeat(40);

export const COMPLETED_RESULT: ScanResult = {
	scanId: SCAN_ID,
	status: "completed",
	report: buildReport(),
	error: null,
	finishedAt: "2026-10-09T10:00:20.000Z",
};

export const useCallbackToken = () => {
	beforeEach(() => {
		vi.stubEnv("SCAN_CALLBACK_TOKEN", CALLBACK_TOKEN);
	});
};

export const callbackRequest = (
	body: unknown,
	authorization: string | undefined,
): Request =>
	new Request(`http://localhost/api/internal/scans/${SCAN_ID}/result`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...(authorization === undefined ? {} : { authorization }),
		},
		body: JSON.stringify(body),
	});
