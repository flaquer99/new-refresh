import {
	AlertDialogCancel,
	AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const CONFIRM_CLASSES =
	"bg-destructive text-destructive-foreground hover:bg-destructive/90 dark:bg-destructive dark:hover:bg-destructive/90";

type DeleteScanDialogActionsProps = {
	isPending: boolean;
};

export function DeleteScanDialogActions({
	isPending,
}: DeleteScanDialogActionsProps) {
	return (
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<Button
				className={CONFIRM_CLASSES}
				disabled={isPending}
				type="submit"
				variant="destructive"
			>
				Delete scan
			</Button>
		</AlertDialogFooter>
	);
}
