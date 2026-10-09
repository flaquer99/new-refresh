"use server";

import { refresh } from "next/cache";
import { type DeleteScanState, deleteScan } from "@/server/scans/delete-scan";

export async function deleteScanAction(
	scanId: string,
	_previous: DeleteScanState | null,
): Promise<DeleteScanState> {
	const result = await deleteScan(scanId);
	if (result.ok) {
		refresh();
	}
	return result;
}
