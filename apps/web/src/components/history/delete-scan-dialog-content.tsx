import { useDeleteScan } from "@/hooks/use-delete-scan";
import { DeleteScanDialogActions } from "./delete-scan-dialog-actions";
import { DeleteScanDialogError } from "./delete-scan-dialog-error";
import { DeleteScanDialogText } from "./delete-scan-dialog-text";

type DeleteScanDialogContentProps = {
	scanId: string;
	startUrl: string;
	titleId: string;
	descriptionId: string;
	onCancel: () => void;
	onDeleted: () => void;
};

export function DeleteScanDialogContent({
	scanId,
	startUrl,
	titleId,
	descriptionId,
	onCancel,
	onDeleted,
}: DeleteScanDialogContentProps) {
	const { state, formAction, isPending } = useDeleteScan({
		scanId,
		startUrl,
		onDeleted,
	});
	return (
		<>
			<DeleteScanDialogText
				descriptionId={descriptionId}
				startUrl={startUrl}
				titleId={titleId}
			/>
			<DeleteScanDialogError state={state} />
			<DeleteScanDialogActions
				formAction={formAction}
				isPending={isPending}
				onCancel={onCancel}
			/>
		</>
	);
}
