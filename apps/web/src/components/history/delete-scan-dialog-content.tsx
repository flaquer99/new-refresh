import { useDeleteScan } from "@/hooks/use-delete-scan";
import { DeleteScanDialogActions } from "./delete-scan-dialog-actions";
import { DeleteScanDialogError } from "./delete-scan-dialog-error";
import { DeleteScanDialogText } from "./delete-scan-dialog-text";

type DeleteScanDialogContentProps = {
	scanId: string;
	startUrl: string;
	onDeleted: () => void;
};

export function DeleteScanDialogContent({
	scanId,
	startUrl,
	onDeleted,
}: DeleteScanDialogContentProps) {
	const { state, formAction, isPending } = useDeleteScan({
		scanId,
		startUrl,
		onDeleted,
	});
	return (
		<form action={formAction} className="grid gap-6">
			<DeleteScanDialogText startUrl={startUrl} />
			<DeleteScanDialogError state={state} />
			<DeleteScanDialogActions isPending={isPending} />
		</form>
	);
}
