import type { StoredScan } from "@refresh/db/scan-store-types";
import { buildReport } from "./report-fixtures";
import { SCAN_ID } from "./scan-route-requests";

export const buildStoredScan = (
	overrides: Partial<StoredScan> = {},
): StoredScan => ({
	scanId: SCAN_ID,
	startUrl: "https://www.example.org/",
	depth: 1,
	status: "completed",
	startedAt: "2026-10-09T10:00:00.000Z",
	finishedAt: "2026-10-09T10:00:20.000Z",
	report: buildReport(),
	error: null,
	...overrides,
});

export const RUNNING_STORED_SCAN = buildStoredScan({
	status: "running",
	finishedAt: null,
	report: null,
});
