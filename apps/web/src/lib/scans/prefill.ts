import {
	ScanDepthSchema,
	type ScanRequest,
	ScanUrlSchema,
} from "@refresh/scan-contracts/scan-request";
import { firstParam, type SearchParams } from "@/lib/search-params";
import { DEFAULT_DEPTH } from "./depth-options";

export const readPrefill = (params: SearchParams): ScanRequest | null => {
	const url = ScanUrlSchema.safeParse(firstParam(params, "url"));
	if (!url.success) {
		return null;
	}
	const depth = ScanDepthSchema.safeParse(Number(firstParam(params, "depth")));
	return { url: url.data, depth: depth.success ? depth.data : DEFAULT_DEPTH };
};

export const runAgainHref = ({ url, depth }: ScanRequest): string =>
	`/?${new URLSearchParams({ url, depth: String(depth) })}`;
