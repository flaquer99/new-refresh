import "server-only";
import type { ScanStore } from "@refresh/db/scan-store-types";
import { MAX_SCAN_DURATION_MS } from "@refresh/scan-contracts/limits";
import { logServerEvent } from "../log/server-log";

const STALE_GRACE_MS = 120_000;

export const STALE_RUNNING_AFTER_MS = MAX_SCAN_DURATION_MS + STALE_GRACE_MS;

export const staleCutoff = (now: Date): Date =>
	new Date(now.getTime() - STALE_RUNNING_AFTER_MS);

export const settleStaleScans = async (store: ScanStore): Promise<void> => {
	const now = new Date();
	const count = await store.settleStale(staleCutoff(now), now);
	if (count > 0) {
		logServerEvent("warn", {
			event: "scan.interrupted",
			reason: "stale",
			count,
		});
	}
};
