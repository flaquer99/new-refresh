import {
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DeleteScanDialogTextProps = {
	startUrl: string;
};

export function DeleteScanDialogText({ startUrl }: DeleteScanDialogTextProps) {
	return (
		<AlertDialogHeader>
			<AlertDialogTitle>Delete this scan?</AlertDialogTitle>
			<AlertDialogDescription>
				The scan of <span className="break-all font-medium">{startUrl}</span>{" "}
				and its report will be removed permanently. This can't be undone.
			</AlertDialogDescription>
		</AlertDialogHeader>
	);
}
