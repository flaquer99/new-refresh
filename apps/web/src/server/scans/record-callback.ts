import "server-only";
import { ScanResultSchema } from "@refresh/scan-contracts/scan-result";
import { getScanStore } from "../db/scan-store";
import { logServerEvent } from "../log/server-log";
import { errorResponse } from "./error-response";
import { readJson } from "./read-json";
import { SCAN_NOT_FOUND_MESSAGE } from "./read-scan-status";

const INVALID_RESULT_MESSAGE = "The scan result is not valid.";

const invalidResult = (scanId: string, issuePath: string): Response => {
	logServerEvent("warn", { event: "callback.invalid", scanId, issuePath });
	return errorResponse("INVALID_REQUEST", INVALID_RESULT_MESSAGE);
};

export const recordCallback = async (
	scanId: string,
	request: Request,
): Promise<Response> => {
	const parsed = ScanResultSchema.safeParse(await readJson(request));
	if (!parsed.success) {
		return invalidResult(
			scanId,
			String(parsed.error.issues[0]?.path.join(".")),
		);
	}
	if (parsed.data.scanId !== scanId) {
		return invalidResult(scanId, "scanId");
	}
	const outcome = await getScanStore().recordResult(parsed.data);
	if (outcome === "not-found") {
		return errorResponse("SCAN_NOT_FOUND", SCAN_NOT_FOUND_MESSAGE);
	}
	return Response.json({ recorded: outcome === "recorded" });
};
