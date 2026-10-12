import "server-only";
import type { ScanStore, StoredScan } from "@refresh/db/scan-store-types";
import { ScanResultSchema } from "@refresh/scan-contracts/scan-result";
import {
	type ScanStatus,
	ScanStatusSchema,
} from "@refresh/scan-contracts/scan-status";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "./error-response";
import { readJson } from "./read-json";
import { scanNotFound } from "./scan-not-found";
import { scanPath } from "./scan-path";
import { toScanStatus } from "./stored-status";
import { forwardToWorker } from "./worker-client";

const HTTP_NOT_FOUND = 404;
const UNREADABLE_STATUS_MESSAGE =
	"Something went wrong on our side. Try again later.";

export type LiveScanRead = {
	store: ScanStore;
	stored: StoredScan;
	clientId: string;
};

const readWorkerStatus = async (
	response: Response,
): Promise<ScanStatus | null> => {
	const status = ScanStatusSchema.safeParse(await readJson(response));
	return status.success ? status.data : null;
};

const recordTerminal = async (
	store: ScanStore,
	status: ScanStatus,
): Promise<boolean> => {
	const result = ScanResultSchema.safeParse({
		scanId: status.scanId,
		status: status.status,
		report: status.report,
		error: status.error,
		finishedAt: new Date().toISOString(),
	});
	if (!result.success) {
		const issue = result.error.issues[0]?.path.join(".") ?? "";
		logServerEvent("warn", {
			event: "scan.result_invalid",
			scanId: status.scanId,
			issue,
		});
		return false;
	}
	await store.recordResult(result.data);
	return true;
};

const interrupted = async (
	store: ScanStore,
	scanId: string,
): Promise<Response> => {
	if (await store.markInterrupted(scanId, new Date())) {
		logServerEvent("warn", {
			event: "scan.interrupted",
			scanId,
			reason: "worker-404",
		});
	}
	const stored = await store.get(scanId);
	return stored ? Response.json(toScanStatus(stored)) : scanNotFound();
};

const settled = async (
	store: ScanStore,
	status: ScanStatus,
): Promise<boolean> =>
	status.status === "running" || (await recordTerminal(store, status));

export const liveScanStatus = async ({
	store,
	stored,
	clientId,
}: LiveScanRead): Promise<Response> => {
	const path = scanPath(stored.scanId);
	const response = await forwardToWorker({ method: "GET", path, clientId });
	if (response.status === HTTP_NOT_FOUND) {
		return await interrupted(store, stored.scanId);
	}
	if (!response.ok) {
		return response;
	}
	const status = await readWorkerStatus(response);
	if (!status) {
		return errorResponse("INTERNAL_ERROR", UNREADABLE_STATUS_MESSAGE);
	}
	return Response.json(
		(await settled(store, status)) ? status : toScanStatus(stored),
	);
};
