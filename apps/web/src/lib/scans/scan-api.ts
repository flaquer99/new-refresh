import {
	type CreateScanResponse,
	CreateScanResponseSchema,
	type ScanRequest,
} from "@refresh/scan-contracts/scan-request";
import {
	type ScanStatus,
	ScanStatusSchema,
} from "@refresh/scan-contracts/scan-status";
import { type ApiResult, requestJson } from "./request-json";

const SCANS_PATH = "/api/scans";

const scanPath = (scanId: string): string =>
	`${SCANS_PATH}/${encodeURIComponent(scanId)}`;

export const startScan = async (
	request: ScanRequest,
): Promise<ApiResult<CreateScanResponse>> =>
	await requestJson({
		path: SCANS_PATH,
		init: {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(request),
		},
		schema: CreateScanResponseSchema,
	});

export const getScan = async (scanId: string): Promise<ApiResult<ScanStatus>> =>
	await requestJson({
		path: scanPath(scanId),
		init: { method: "GET", cache: "no-store" },
		schema: ScanStatusSchema,
	});

export const cancelScan = async (
	scanId: string,
): Promise<ApiResult<ScanStatus>> =>
	await requestJson({
		path: scanPath(scanId),
		init: { method: "DELETE" },
		schema: ScanStatusSchema,
	});
