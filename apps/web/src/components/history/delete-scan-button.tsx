"use client";

import { useModalDialog } from "@/hooks/use-modal-dialog";
import { DeleteScanDialog } from "./delete-scan-dialog";

type DeleteScanButtonProps = {
	scanId: string;
	startUrl: string;
};

export function DeleteScanButton({ scanId, startUrl }: DeleteScanButtonProps) {
	const { dialogRef, triggerRef, open, close, dismiss, restoreFocus } =
		useModalDialog();
	return (
		<>
			<button
				aria-label={`Delete scan of ${startUrl}`}
				className="rounded-md border border-destructive px-3 py-1 font-medium text-destructive text-sm"
				onClick={open}
				ref={triggerRef}
				type="button"
			>
				Delete
			</button>
			<DeleteScanDialog
				dialogRef={dialogRef}
				onCancel={close}
				onClose={restoreFocus}
				onDeleted={dismiss}
				scanId={scanId}
				startUrl={startUrl}
			/>
		</>
	);
}
