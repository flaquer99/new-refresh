"use client";

import { AlertDialogContent } from "@/components/ui/alert-dialog";
import { DeleteScanDialogContent } from "./delete-scan-dialog-content";

type DeleteScanDialogProps = {
	scanId: string;
	startUrl: string;
	restoresFocus: boolean;
	onDeleted: () => void;
};

export function DeleteScanDialog({
	scanId,
	startUrl,
	restoresFocus,
	onDeleted,
}: DeleteScanDialogProps) {
	return (
		<AlertDialogContent finalFocus={restoresFocus}>
			<DeleteScanDialogContent
				onDeleted={onDeleted}
				scanId={scanId}
				startUrl={startUrl}
			/>
		</AlertDialogContent>
	);
}
