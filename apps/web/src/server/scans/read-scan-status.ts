import "server-only";
import { z } from "zod";
import type { ScanActor } from "../auth/get-scan-actor";
import { getScanStore } from "../db/scan-store";
import { liveScanStatus } from "./live-scan-status";
import { scanNotFound } from "./scan-not-found";
import { settleStaleScans } from "./stale-scans";
import { toScanStatus } from "./stored-status";

const ScanIdSchema = z.uuid();

export type ReadScanStatusInput = { scanId: string; actor: ScanActor };

export const readScanStatus = async ({
	scanId,
	actor,
}: ReadScanStatusInput): Promise<Response> => {
	if (!ScanIdSchema.safeParse(scanId).success) {
		return scanNotFound();
	}
	const store = getScanStore();
	await settleStaleScans(store);
	const stored = await store.get({
		scanId,
		organizationId: actor.organizationId,
	});
	if (!stored) {
		return scanNotFound();
	}
	if (stored.status !== "running") {
		return Response.json(toScanStatus(stored));
	}
	return await liveScanStatus({ store, stored, clientId: actor.userId });
};
