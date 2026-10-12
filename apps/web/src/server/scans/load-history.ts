import "server-only";
import type { ScanHistoryPage } from "@refresh/db/scan-store-types";
import { connection } from "next/server";
import { getScanStore } from "../db/scan-store";
import { settleStaleScans } from "./stale-scans";

export const HISTORY_PAGE_SIZE = 20;

export const loadHistory = async (
	before: string | null,
): Promise<ScanHistoryPage> => {
	await connection();
	const store = getScanStore();
	await settleStaleScans(store);
	return await store.list({ before, limit: HISTORY_PAGE_SIZE });
};
