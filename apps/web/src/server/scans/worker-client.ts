import "server-only";
import { errorResponse } from "./error-response";
import { readWorkerConfig, type WorkerConfig } from "./worker-config";

const WORKER_TIMEOUT_MS = 10_000;
const HTTP_UNAUTHORIZED = 401;
const WORKER_UNAVAILABLE_MESSAGE =
	"The scanner is not available right now. Try again in a moment.";
const MISCONFIGURED_MESSAGE =
	"Something went wrong on our side. Try again later.";

export type WorkerRequest = {
	method: "GET" | "POST" | "DELETE";
	path: string;
	clientId: string;
	body?: unknown;
};

type WorkerCall = {
	request: WorkerRequest;
	config: WorkerConfig;
	signal: AbortSignal;
};

const workerHeaders = ({ request, config }: WorkerCall): Headers => {
	const headers = new Headers({
		authorization: `Bearer ${config.token}`,
		"x-client-id": request.clientId,
	});
	if (request.body !== undefined) {
		headers.set("content-type", "application/json");
	}
	return headers;
};

const relay = async (response: Response): Promise<Response> => {
	if (response.status === HTTP_UNAUTHORIZED) {
		return errorResponse("INTERNAL_ERROR", MISCONFIGURED_MESSAGE);
	}
	const contentType = response.headers.get("content-type");
	const body = await response.text();
	return new Response(body || null, {
		status: response.status,
		headers: contentType ? { "content-type": contentType } : undefined,
	});
};

const callWorker = async (call: WorkerCall): Promise<Response> => {
	const { request, config, signal } = call;
	const response = await fetch(`${config.url}${request.path}`, {
		method: request.method,
		signal,
		headers: workerHeaders(call),
		body: request.body === undefined ? undefined : JSON.stringify(request.body),
	});
	return await relay(response);
};

export const forwardToWorker = async (
	request: WorkerRequest,
): Promise<Response> => {
	const config = readWorkerConfig();
	if (!config) {
		return errorResponse("INTERNAL_ERROR", MISCONFIGURED_MESSAGE);
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), WORKER_TIMEOUT_MS);
	try {
		return await callWorker({ request, config, signal: controller.signal });
	} catch {
		return errorResponse("WORKER_UNAVAILABLE", WORKER_UNAVAILABLE_MESSAGE);
	} finally {
		clearTimeout(timer);
	}
};
