import type { FindingPreview } from "@refresh/scan-contracts/preview-ui";
import { useEffect, useState } from "react";
import { getFindingPreview } from "@/lib/preview/preview-api";
import type { ApiResult } from "@/lib/scans/request-json";

export type FindingPreviewState = "loading" | ApiResult<FindingPreview>;

type FindingPreviewParams = {
	scanId: string;
	findingId: string;
};

export function useFindingPreview({
	scanId,
	findingId,
}: FindingPreviewParams): FindingPreviewState {
	const [state, setState] = useState<FindingPreviewState>("loading");
	useEffect(() => {
		const controller = new AbortController();
		const load = async () => {
			const result = await getFindingPreview({
				scanId,
				findingId,
				signal: controller.signal,
			});
			if (!controller.signal.aborted) {
				setState(result);
			}
		};
		load();
		return () => {
			controller.abort();
		};
	}, [scanId, findingId]);
	return state;
}
