import "server-only";
import { z } from "zod";
import { canManageScan } from "../auth/can-manage-scan";
import type { ScanActor } from "../auth/get-scan-actor";
import { getScanStore } from "../db/scan-store";
import { errorResponse } from "./error-response";
import { scanNotFound } from "./scan-not-found";
import { scanPath } from "./scan-path";
import { forwardToWorker } from "./worker-client";

const ScanIdSchema = z.uuid();

export const CANCEL_FORBIDDEN_MESSAGE =
	"Only admins can cancel scans started by someone else.";

export type CancelScanInput = { scanId: string; actor: ScanActor };

export const cancelScan = async ({
	scanId,
	actor,
}: CancelScanInput): Promise<Response> => {
	if (!ScanIdSchema.safeParse(scanId).success) {
		return scanNotFound();
	}
	const stored = await getScanStore().get({
		scanId,
		organizationId: actor.organizationId,
	});
	if (!stored) {
		return scanNotFound();
	}
	if (!canManageScan(actor, stored)) {
		return errorResponse("FORBIDDEN", CANCEL_FORBIDDEN_MESSAGE);
	}
	return await forwardToWorker({
		method: "DELETE",
		path: scanPath(scanId),
		clientId: actor.userId,
	});
};
