import { resolveClientId } from "@/server/scans/client-id";
import { readScanStatus } from "@/server/scans/read-scan-status";
import { scanPath } from "@/server/scans/scan-path";
import { withStoreErrors } from "@/server/scans/store-errors";
import { forwardToWorker } from "@/server/scans/worker-client";

type ScanRouteContext = RouteContext<"/api/scans/[id]">;

export async function GET(
	request: Request,
	context: ScanRouteContext,
): Promise<Response> {
	const { id } = await context.params;
	const response = await withStoreErrors("readScanStatus", () =>
		readScanStatus({ scanId: id, clientId: resolveClientId(request.headers) }),
	);
	response.headers.set("cache-control", "no-store");
	return response;
}

export async function DELETE(
	request: Request,
	context: ScanRouteContext,
): Promise<Response> {
	const { id } = await context.params;
	return await forwardToWorker({
		method: "DELETE",
		path: scanPath(id),
		clientId: resolveClientId(request.headers),
	});
}
