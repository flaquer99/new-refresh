"use client";

import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { DeleteScanDialog } from "./delete-scan-dialog";

type DeleteScanButtonProps = {
	scanId: string;
	startUrl: string;
};

export function DeleteScanButton({ scanId, startUrl }: DeleteScanButtonProps) {
	const { open, onOpenChange, markDeleted, restoresFocus } = useDeleteDialog();
	return (
		<AlertDialog onOpenChange={onOpenChange} open={open}>
			<AlertDialogTrigger
				render={
					<Button
						aria-label={`Delete scan of ${startUrl}`}
						size="sm"
						variant="outline"
					/>
				}
			>
				Delete
			</AlertDialogTrigger>
			<DeleteScanDialog
				onDeleted={markDeleted}
				restoresFocus={restoresFocus}
				scanId={scanId}
				startUrl={startUrl}
			/>
		</AlertDialog>
	);
}
