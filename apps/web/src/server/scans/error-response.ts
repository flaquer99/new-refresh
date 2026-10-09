import {
	type ErrorEnvelope,
	type HttpScanErrorCode,
	SCAN_ERROR_HTTP_STATUS,
} from "@refresh/scan-contracts/errors";

export const errorResponse = (
	code: HttpScanErrorCode,
	message: string,
): Response => {
	const envelope: ErrorEnvelope = { error: { code, message } };
	return Response.json(envelope, { status: SCAN_ERROR_HTTP_STATUS[code] });
};
