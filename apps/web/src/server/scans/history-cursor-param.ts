import "server-only";
import { decodeCursor } from "@refresh/db/history-cursor";
import { firstParam, type SearchParams } from "@/lib/search-params";

export const readHistoryCursor = (params: SearchParams): string | null => {
	const before = firstParam(params, "before");
	if (before === undefined || decodeCursor(before) === null) {
		return null;
	}
	return before;
};
