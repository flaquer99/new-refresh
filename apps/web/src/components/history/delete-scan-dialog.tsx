"use client";

import type { RefObject } from "react";
import { useDeleteScan } from "@/hooks/use-delete-scan";
import { DeleteScanDialogActions } from "./delete-scan-dialog-actions";
import { DeleteScanDialogText } from "./delete-scan-dialog-text";

type DeleteScanDialogProps = {
	scanId: string;
	startUrl: string;
	dialogRef: RefObject<HTMLDialogElement | null>;
	onCancel: () => void;
	onClose: () => void;
};

export function DeleteScanDialog({
	scanId,
	startUrl,
	dialogRef,
	onCancel,
	onClose,
}: DeleteScanDialogProps) {
	const { state, formAction, isPending } = useDeleteScan({ scanId, startUrl });
	const titleId = `delete-${scanId}-title`;
	const descriptionId = `delete-${scanId}-description`;
	return (
		<dialog
			aria-describedby={descriptionId}
			aria-labelledby={titleId}
			className="inset-4 m-auto w-auto max-w-md rounded-lg border border-border bg-background p-6 text-foreground"
			onClose={onClose}
			ref={dialogRef}
		>
			<DeleteScanDialogText
				descriptionId={descriptionId}
				startUrl={startUrl}
				titleId={titleId}
			/>
			{state && !state.ok ? (
				<p className="mt-2 text-destructive" role="alert">
					{state.error.message}
				</p>
			) : null}
			<DeleteScanDialogActions
				formAction={formAction}
				isPending={isPending}
				onCancel={onCancel}
			/>
		</dialog>
	);
}
