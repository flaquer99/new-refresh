import "server-only";
import type { StoredScan } from "@refresh/db/scan-store-types";
import { connection } from "next/server";
import { cache } from "react";
import { z } from "zod";
import { getScanStore } from "../db/scan-store";
import { settleStaleScans } from "./stale-scans";

const ScanIdSchema = z.uuid();

export const loadScan = cache(
	async (scanId: string): Promise<StoredScan | null> => {
		await connection();
		if (!ScanIdSchema.safeParse(scanId).success) {
			return null;
		}
		const store = getScanStore();
		await settleStaleScans(store);
		return await store.get(scanId);
	},
);
