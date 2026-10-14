import type { ScanHistoryEntry as StoredHistoryEntry } from "@refresh/db/scan-store-types";
import type { ScanHistoryEntry } from "@/server/scans/scan-read-models";

export const HISTORY_NOW = new Date("2026-10-09T12:00:00.000Z");

export const buildHistoryEntry = (
	overrides: Partial<ScanHistoryEntry> = {},
): ScanHistoryEntry => ({
	scanId: "8f0c6b8e-3a8e-4d0b-9a57-2f5a1d6f4c11",
	startedByName: "Ana Souza",
	startUrl: "https://www.example.org/",
	status: "completed",
	outcome: "complete",
	depth: 1,
	startedAt: "2026-10-09T11:55:00.000Z",
	pagesScanned: 12,
	violationsBySeverity: { critical: 2, serious: 11, moderate: 4, minor: 0 },
	error: null,
	canDelete: true,
	...overrides,
});

export const buildStoredHistoryEntry = (
	overrides: Partial<StoredHistoryEntry> = {},
): StoredHistoryEntry => {
	const { canDelete, ...visible } = buildHistoryEntry();
	return {
		...visible,
		startedByUserId: "user_test",
		deletable: canDelete,
		...overrides,
	};
};
