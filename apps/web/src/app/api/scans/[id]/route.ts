import { resolveClientId } from "@/server/scans/client-id";
import { scanPath } from "@/server/scans/scan-path";
import {
	forwardToWorker,
	type WorkerRequest,
} from "@/server/scans/worker-client";

type ScanRouteContext = RouteContext<"/api/scans/[id]">;

const forwardScanRequest = async (
	method: WorkerRequest["method"],
	request: Request,
	context: ScanRouteContext,
): Promise<Response> => {
	const { id } = await context.params;
	return await forwardToWorker({
		method,
		path: scanPath(id),
		clientId: resolveClientId(request.headers),
	});
};

export async function GET(
	request: Request,
	context: ScanRouteContext,
): Promise<Response> {
	const response = await forwardScanRequest("GET", request, context);
	response.headers.set("cache-control", "no-store");
	return response;
}

export async function DELETE(
	request: Request,
	context: ScanRouteContext,
): Promise<Response> {
	return await forwardScanRequest("DELETE", request, context);
}
