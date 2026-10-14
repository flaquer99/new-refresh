import { requireApiActor } from "@/server/auth/require-api-actor";
import { cancelScan } from "@/server/scans/cancel-scan";
import { readScanStatus } from "@/server/scans/read-scan-status";
import { withStoreErrors } from "@/server/scans/store-errors";

type ScanRouteContext = RouteContext<"/api/scans/[id]">;

export async function GET(
	_request: Request,
	context: ScanRouteContext,
): Promise<Response> {
	const auth = await requireApiActor();
	if (!auth.ok) {
		return auth.response;
	}
	const { id } = await context.params;
	const response = await withStoreErrors("readScanStatus", () =>
		readScanStatus({ scanId: id, actor: auth.actor }),
	);
	response.headers.set("cache-control", "no-store");
	return response;
}

export async function DELETE(
	_request: Request,
	context: ScanRouteContext,
): Promise<Response> {
	const auth = await requireApiActor();
	if (!auth.ok) {
		return auth.response;
	}
	const { id } = await context.params;
	return await withStoreErrors("cancelScan", () =>
		cancelScan({ scanId: id, actor: auth.actor }),
	);
}
