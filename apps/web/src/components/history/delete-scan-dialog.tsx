"use client";

import type { RefObject } from "react";
import { DeleteScanDialogContent } from "./delete-scan-dialog-content";

type DeleteScanDialogProps = {
	scanId: string;
	startUrl: string;
	dialogRef: RefObject<HTMLDialogElement | null>;
	onCancel: () => void;
	onClose: () => void;
	onDeleted: () => void;
};

export function DeleteScanDialog({
	scanId,
	startUrl,
	dialogRef,
	onCancel,
	onClose,
	onDeleted,
}: DeleteScanDialogProps) {
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
			<DeleteScanDialogContent
				descriptionId={descriptionId}
				onCancel={onCancel}
				onDeleted={onDeleted}
				scanId={scanId}
				startUrl={startUrl}
				titleId={titleId}
			/>
		</dialog>
	);
}
