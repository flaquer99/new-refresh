import { useRef } from "react";
import { NewScanDialogActions } from "./new-scan-dialog-actions";
import { NewScanDialogText } from "./new-scan-dialog-text";

const TITLE_ID = "new-scan-dialog-title";
const DESCRIPTION_ID = "new-scan-dialog-description";

type NewScanDialogProps = {
	onConfirm: () => void;
};

export function NewScanDialog({ onConfirm }: NewScanDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);
	return (
		<>
			<button
				className="rounded-md border border-border px-4 py-2 font-medium"
				onClick={() => dialogRef.current?.showModal()}
				type="button"
			>
				New scan
			</button>
			<dialog
				aria-describedby={DESCRIPTION_ID}
				aria-labelledby={TITLE_ID}
				className="inset-4 m-auto w-auto max-w-md rounded-lg border border-border bg-background p-6 text-foreground"
				ref={dialogRef}
			>
				<NewScanDialogText descriptionId={DESCRIPTION_ID} titleId={TITLE_ID} />
				<NewScanDialogActions
					onConfirm={onConfirm}
					onKeep={() => dialogRef.current?.close()}
				/>
			</dialog>
		</>
	);
}
