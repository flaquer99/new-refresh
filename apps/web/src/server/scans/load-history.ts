import "server-only";
import type {
	ScanHistoryPage,
	ScanHistoryEntry as StoredEntry,
} from "@refresh/db/scan-store-types";
import { connection } from "next/server";
import { canManageScan } from "../auth/can-manage-scan";
import type { ScanActor } from "../auth/get-scan-actor";
import { requirePageActor } from "../auth/require-page-actor";
import { getScanStore } from "../db/scan-store";
import type { ScanHistoryEntry } from "./scan-read-models";
import { settleStaleScans } from "./stale-scans";

export const HISTORY_PAGE_SIZE = 20;

export type HistoryView = {
	entries: ScanHistoryEntry[];
	nextBefore: string | null;
};

const toDisplayEntry = (
	entry: StoredEntry,
	actor: ScanActor,
): ScanHistoryEntry => {
	const { startedByUserId, deletable, ...visible } = entry;
	const manageable = canManageScan(actor, {
		organizationId: actor.organizationId,
		startedByUserId,
	});
	return { ...visible, canDelete: deletable && manageable };
};

const toHistoryView = (
	page: ScanHistoryPage,
	actor: ScanActor,
): HistoryView => ({
	entries: page.entries.map((entry) => toDisplayEntry(entry, actor)),
	nextBefore: page.nextBefore,
});

export const loadHistory = async (
	before: string | null,
): Promise<HistoryView> => {
	await connection();
	const actor = await requirePageActor();
	const store = getScanStore();
	await settleStaleScans(store);
	const page = await store.list({
		organizationId: actor.organizationId,
		before,
		limit: HISTORY_PAGE_SIZE,
	});
	return toHistoryView(page, actor);
};
