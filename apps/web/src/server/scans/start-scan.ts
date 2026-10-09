import "server-only";
import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { getScanStore } from "../db/scan-store";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "./error-response";
import { logStoreFailure, STORE_UNAVAILABLE_MESSAGE } from "./store-errors";
import { forwardToWorker } from "./worker-client";

const HTTP_CREATED = 201;
const HTTP_BAD_GATEWAY = 502;

export type StartScanInput = { request: ScanRequest; clientId: string };

const insertRunning = async (
	scanId: string,
	request: ScanRequest,
): Promise<boolean> => {
	try {
		await getScanStore().createRunning({
			scanId,
			request,
			startedAt: new Date(),
		});
		return true;
	} catch (error) {
		logStoreFailure("createRunning", error);
		return false;
	}
};

const discardRejected = async (scanId: string, status: number) => {
	if (status === HTTP_BAD_GATEWAY) {
		logServerEvent("warn", { event: "scan.discarded_after_timeout", scanId });
	}
	try {
		await getScanStore().discard(scanId);
	} catch (error) {
		logStoreFailure("discard", error);
	}
};

export const startScan = async ({
	request,
	clientId,
}: StartScanInput): Promise<Response> => {
	const scanId = crypto.randomUUID();
	if (!(await insertRunning(scanId, request))) {
		return errorResponse("INTERNAL_ERROR", STORE_UNAVAILABLE_MESSAGE);
	}
	const response = await forwardToWorker({
		method: "POST",
		path: "/scans",
		clientId,
		body: { scanId, ...request },
	});
	if (response.status !== HTTP_CREATED) {
		await discardRejected(scanId, response.status);
		return response;
	}
	return Response.json({ scanId }, { status: HTTP_CREATED });
};
