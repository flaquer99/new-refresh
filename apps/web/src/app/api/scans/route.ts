import { resolveClientId } from "@/server/scans/client-id";
import { readScanRequest } from "@/server/scans/read-scan-request";
import { startScan } from "@/server/scans/start-scan";

export async function POST(request: Request): Promise<Response> {
	const result = await readScanRequest(request);
	if (!result.ok) {
		return result.response;
	}
	return await startScan({
		request: result.scanRequest,
		clientId: resolveClientId(request.headers),
	});
}
