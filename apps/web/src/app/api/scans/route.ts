import { resolveClientId } from "@/server/scans/client-id";
import { readScanRequest } from "@/server/scans/read-scan-request";
import { forwardToWorker } from "@/server/scans/worker-client";

export async function POST(request: Request): Promise<Response> {
	const result = await readScanRequest(request);
	if (!result.ok) {
		return result.response;
	}
	return await forwardToWorker({
		method: "POST",
		path: "/scans",
		clientId: resolveClientId(request.headers),
		body: result.scanRequest,
	});
}
