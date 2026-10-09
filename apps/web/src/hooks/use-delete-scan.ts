import { use, useActionState } from "react";
import { deleteScanAction } from "@/app/scans/actions";
import { HistoryAnnouncerContext } from "@/components/history/history-announcer-context";
import type { DeleteScanState } from "@/server/scans/delete-scan";

type DeleteTarget = { scanId: string; startUrl: string };

export function useDeleteScan({ scanId, startUrl }: DeleteTarget) {
	const announce = use(HistoryAnnouncerContext);
	const run = async (previous: DeleteScanState | null) => {
		const result = await deleteScanAction(scanId, previous);
		if (result.ok) {
			announce(`Scan of ${startUrl} deleted.`);
		}
		return result;
	};
	const [state, formAction, isPending] = useActionState(run, null);
	return { state, formAction, isPending };
}
