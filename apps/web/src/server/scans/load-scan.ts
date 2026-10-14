import "server-only";
import type { StoredScan } from "@refresh/db/scan-store-types";
import { connection } from "next/server";
import { cache } from "react";
import { z } from "zod";
import { canManageScan } from "../auth/can-manage-scan";
import { requirePageActor } from "../auth/require-page-actor";
import { getScanStore } from "../db/scan-store";
import { settleStaleScans } from "./stale-scans";

const ScanIdSchema = z.uuid();

export type LoadedScan = { scan: StoredScan; canManage: boolean };

export const loadScan = cache(
	async (scanId: string): Promise<LoadedScan | null> => {
		await connection();
		const actor = await requirePageActor();
		if (!ScanIdSchema.safeParse(scanId).success) {
			return null;
		}
		const store = getScanStore();
		await settleStaleScans(store);
		const scan = await store.get({
			scanId,
			organizationId: actor.organizationId,
		});
		return scan ? { scan, canManage: canManageScan(actor, scan) } : null;
	},
);
