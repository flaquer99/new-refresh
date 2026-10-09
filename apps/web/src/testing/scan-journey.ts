import { POST as postResult } from "@/app/api/internal/scans/[id]/result/route";
import { GET as getScan } from "@/app/api/scans/[id]/route";
import { POST as startScan } from "@/app/api/scans/route";
import {
	CALLBACK_TOKEN,
	COMPLETED_RESULT,
	callbackRequest,
} from "./callback-requests";
import {
	SCAN_ID,
	scanRequest,
	scanRouteContext,
	startScanRequest,
	VALID_SCAN_BODY,
} from "./scan-route-requests";

export const startStoredScan = () =>
	startScan(startScanRequest(VALID_SCAN_BODY));

export const deliverResult = (result: unknown = COMPLETED_RESULT) =>
	postResult(
		callbackRequest(result, `Bearer ${CALLBACK_TOKEN}`),
		scanRouteContext(SCAN_ID),
	);

export const readScan = async () => {
	const response = await getScan(scanRequest("GET"), scanRouteContext(SCAN_ID));
	return { status: response.status, body: await response.json() };
};
