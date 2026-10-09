type DeleteScanDialogActionsProps = {
	formAction: () => void;
	isPending: boolean;
	onCancel: () => void;
};

export function DeleteScanDialogActions({
	formAction,
	isPending,
	onCancel,
}: DeleteScanDialogActionsProps) {
	return (
		<form action={formAction} className="mt-6 flex flex-wrap justify-end gap-3">
			<button
				className="rounded-md border border-border px-4 py-2 font-medium"
				data-initial-focus
				onClick={onCancel}
				type="button"
			>
				Cancel
			</button>
			<button
				className="rounded-md bg-destructive px-4 py-2 font-medium text-primary-foreground"
				disabled={isPending}
				type="submit"
			>
				Delete scan
			</button>
		</form>
	);
}
