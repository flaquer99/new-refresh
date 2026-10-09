import "server-only";
import type { ScanStore, StoredScan } from "@refresh/db/scan-store-types";
import { ScanResultSchema } from "@refresh/scan-contracts/scan-result";
import {
	type ScanStatus,
	ScanStatusSchema,
} from "@refresh/scan-contracts/scan-status";
import { z } from "zod";
import { getScanStore } from "../db/scan-store";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "./error-response";
import { scanPath } from "./scan-path";
import { settleStaleScans } from "./stale-scans";
import { toScanStatus } from "./stored-status";
import { forwardToWorker } from "./worker-client";

const HTTP_NOT_FOUND = 404;
const ScanIdSchema = z.uuid();
export const SCAN_NOT_FOUND_MESSAGE =
	"This scan doesn't exist. It may have been deleted.";
const UNREADABLE_STATUS_MESSAGE =
	"Something went wrong on our side. Try again later.";

export type ReadScanStatusInput = { scanId: string; clientId: string };

const notFound = (): Response =>
	errorResponse("SCAN_NOT_FOUND", SCAN_NOT_FOUND_MESSAGE);

const recordTerminal = async (store: ScanStore, status: ScanStatus) => {
	const result = ScanResultSchema.safeParse({
		scanId: status.scanId,
		status: status.status,
		report: status.report,
		error: status.error,
		finishedAt: new Date().toISOString(),
	});
	if (result.success) {
		await store.recordResult(result.data);
	}
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
	return stored ? Response.json(toScanStatus(stored)) : notFound();
};

const liveStatus = async (
	store: ScanStore,
	stored: StoredScan,
	clientId: string,
): Promise<Response> => {
	const response = await forwardToWorker({
		method: "GET",
		path: scanPath(stored.scanId),
		clientId,
	});
	if (response.status === HTTP_NOT_FOUND) {
		return await interrupted(store, stored.scanId);
	}
	if (!response.ok) {
		return response;
	}
	const status = ScanStatusSchema.safeParse(await response.json());
	if (!status.success) {
		return errorResponse("INTERNAL_ERROR", UNREADABLE_STATUS_MESSAGE);
	}
	if (status.data.status !== "running") {
		await recordTerminal(store, status.data);
	}
	return Response.json(status.data);
};

export const readScanStatus = async ({
	scanId,
	clientId,
}: ReadScanStatusInput): Promise<Response> => {
	if (!ScanIdSchema.safeParse(scanId).success) {
		return notFound();
	}
	const store = getScanStore();
	await settleStaleScans(store);
	const stored = await store.get(scanId);
	if (!stored) {
		return notFound();
	}
	if (stored.status !== "running") {
		return Response.json(toScanStatus(stored));
	}
	return await liveStatus(store, stored, clientId);
};
