import {
	type FindingPreview,
	FindingPreviewSchema,
} from "@refresh/scan-contracts/preview-ui";
import { type ApiResult, requestJson } from "@/lib/scans/request-json";

type PreviewRequest = {
	scanId: string;
	findingId: string;
	signal: AbortSignal;
};

export const previewPath = (scanId: string, findingId: string): string =>
	`/api/scans/${encodeURIComponent(scanId)}/findings/${encodeURIComponent(findingId)}/preview`;

export const getFindingPreview = async ({
	scanId,
	findingId,
	signal,
}: PreviewRequest): Promise<ApiResult<FindingPreview>> =>
	await requestJson({
		path: previewPath(scanId, findingId),
		init: { method: "GET", cache: "no-store", signal },
		schema: FindingPreviewSchema,
	});
