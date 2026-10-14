import "server-only";
import {
	PREVIEW_WORKER_TIMEOUT_MS,
	type PreviewFetchResult,
	PreviewFetchResultSchema,
} from "@refresh/scan-contracts/preview";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "../scans/error-response";
import { STORE_UNAVAILABLE_MESSAGE } from "../scans/store-errors";
import { forwardToWorker, isWorkerTimeout } from "../scans/worker-client";

export type PreviewPageOutcome =
	| PreviewFetchResult
	| { kind: "worker-error"; response: Response };

export type RequestPreviewPageParams = {
	pageUrl: string;
	clientId: string;
};

const TIMEOUT_OUTCOME: PreviewPageOutcome = {
	kind: "unavailable",
	reason: "timeout",
	httpStatus: null,
};

const invalidWorkerResponse = (): PreviewPageOutcome => {
	logServerEvent("error", { event: "preview.invalid_worker_response" });
	return {
		kind: "worker-error",
		response: errorResponse("INTERNAL_ERROR", STORE_UNAVAILABLE_MESSAGE),
	};
};

const readOutcome = async (response: Response): Promise<PreviewPageOutcome> => {
	const body: unknown = await response.json().catch(() => null);
	const parsed = PreviewFetchResultSchema.safeParse(body);
	return parsed.success ? parsed.data : invalidWorkerResponse();
};

export const requestPreviewPage = async ({
	pageUrl,
	clientId,
}: RequestPreviewPageParams): Promise<PreviewPageOutcome> => {
	const response = await forwardToWorker({
		method: "POST",
		path: "/previews",
		clientId,
		body: { pageUrl },
		timeoutMs: PREVIEW_WORKER_TIMEOUT_MS,
	});
	if (isWorkerTimeout(response)) {
		return TIMEOUT_OUTCOME;
	}
	if (!response.ok) {
		return { kind: "worker-error", response };
	}
	return await readOutcome(response);
};
