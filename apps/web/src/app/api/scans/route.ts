import { requireApiActor } from "@/server/auth/require-api-actor";
import { readScanRequest } from "@/server/scans/read-scan-request";
import { startScan } from "@/server/scans/start-scan";

export async function POST(request: Request): Promise<Response> {
	const auth = await requireApiActor();
	if (!auth.ok) {
		return auth.response;
	}
	const result = await readScanRequest(request);
	if (!result.ok) {
		return result.response;
	}
	return await startScan({ request: result.scanRequest, actor: auth.actor });
}
