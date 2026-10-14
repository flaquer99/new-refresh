import type { ScanHistoryEntry as StoredHistoryEntry } from "@refresh/db/scan-store-types";

export type {
	StoredScan,
	ViolationsBySeverity,
} from "@refresh/db/scan-store-types";

export type ScanHistoryEntry = Omit<
	StoredHistoryEntry,
	"startedByUserId" | "deletable"
> & { canDelete: boolean };
