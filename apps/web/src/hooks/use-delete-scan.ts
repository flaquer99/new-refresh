import { use, useActionState } from "react";
import { deleteScanAction } from "@/app/scans/actions";
import { HistoryAnnouncerContext } from "@/components/history/history-announcer-context";
import type { DeleteScanState } from "@/server/scans/delete-scan";

type DeleteTarget = {
	scanId: string;
	startUrl: string;
	onDeleted: () => void;
};

export function useDeleteScan({ scanId, startUrl, onDeleted }: DeleteTarget) {
	const announce = use(HistoryAnnouncerContext);
	const run = async () => {
		const result = await deleteScanAction(scanId);
		if (result.ok) {
			onDeleted();
			announce({ scanId, message: `Scan of ${startUrl} deleted.` });
		}
		return result;
	};
	const [state, formAction, isPending] = useActionState<DeleteScanState | null>(
		run,
		null,
	);
	return { state, formAction, isPending };
}
