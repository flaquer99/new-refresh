import "server-only";
import type { ScanOwner } from "@refresh/db/scan-store-types";
import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import type { ScanActor } from "../auth/get-scan-actor";
import { resolveStarterName } from "../auth/resolve-starter-name";
import { getScanStore } from "../db/scan-store";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "./error-response";
import { logStoreFailure, STORE_UNAVAILABLE_MESSAGE } from "./store-errors";
import { forwardToWorker, isWorkerTimeout } from "./worker-client";

const HTTP_CREATED = 201;

export type StartScanInput = { request: ScanRequest; actor: ScanActor };

type InsertRunning = {
	scanId: string;
	request: ScanRequest;
	owner: ScanOwner;
};

const insertRunning = async ({
	scanId,
	request,
	owner,
}: InsertRunning): Promise<boolean> => {
	try {
		await getScanStore().createRunning({
			scanId,
			request,
			startedAt: new Date(),
			owner,
		});
		return true;
	} catch (error) {
		logStoreFailure("createRunning", error);
		return false;
	}
};

const discardRejected = async (scanId: string, response: Response) => {
	if (isWorkerTimeout(response)) {
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
	actor,
}: StartScanInput): Promise<Response> => {
	const scanId = crypto.randomUUID();
	const owner: ScanOwner = {
		organizationId: actor.organizationId,
		startedByUserId: actor.userId,
		startedByName: await resolveStarterName(),
	};
	if (!(await insertRunning({ scanId, request, owner }))) {
		return errorResponse("INTERNAL_ERROR", STORE_UNAVAILABLE_MESSAGE);
	}
	const response = await forwardToWorker({
		method: "POST",
		path: "/scans",
		clientId: actor.userId,
		body: { scanId, ...request },
	});
	if (response.status !== HTTP_CREATED) {
		await discardRejected(scanId, response);
		return response;
	}
	return Response.json({ scanId }, { status: HTTP_CREATED });
};
