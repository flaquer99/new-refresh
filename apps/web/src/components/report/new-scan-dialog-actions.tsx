type NewScanDialogActionsProps = {
	onKeep: () => void;
	onConfirm: () => void;
};

export function NewScanDialogActions({
	onKeep,
	onConfirm,
}: NewScanDialogActionsProps) {
	return (
		<div className="mt-6 flex flex-wrap justify-end gap-3">
			<button
				className="rounded-md border border-border px-4 py-2 font-medium"
				onClick={onKeep}
				type="button"
			>
				Keep this report
			</button>
			<button
				className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground"
				onClick={onConfirm}
				type="button"
			>
				Start a new scan
			</button>
		</div>
	);
}
