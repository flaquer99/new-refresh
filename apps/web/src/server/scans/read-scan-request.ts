import {
	INVALID_DEPTH_MESSAGE,
	INVALID_URL_MESSAGE,
	type ScanRequest,
	ScanRequestSchema,
} from "@refresh/scan-contracts/scan-request";
import type { z } from "zod";
import { errorResponse } from "./error-response";
import { readJson } from "./read-json";

const MALFORMED_BODY_MESSAGE =
	"Send a JSON body with a url and a depth to start a scan.";

const FIELD_MESSAGES: Record<string, string> = {
	url: INVALID_URL_MESSAGE,
	depth: INVALID_DEPTH_MESSAGE,
};

export type ScanRequestResult =
	| { ok: true; scanRequest: ScanRequest }
	| { ok: false; response: Response };

const invalidMessage = (error: z.ZodError): string => {
	const field = String(error.issues[0]?.path[0] ?? "");
	return FIELD_MESSAGES[field] ?? MALFORMED_BODY_MESSAGE;
};

export const readScanRequest = async (
	request: Request,
): Promise<ScanRequestResult> => {
	const parsed = ScanRequestSchema.safeParse(await readJson(request));
	if (parsed.success) {
		return { ok: true, scanRequest: parsed.data };
	}
	return {
		ok: false,
		response: errorResponse("INVALID_REQUEST", invalidMessage(parsed.error)),
	};
};
