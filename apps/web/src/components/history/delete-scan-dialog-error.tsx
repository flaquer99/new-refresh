import type { DeleteScanState } from "@/server/scans/delete-scan";

type DeleteScanDialogErrorProps = {
	state: DeleteScanState | null;
};

export function DeleteScanDialogError({ state }: DeleteScanDialogErrorProps) {
	if (!state || state.ok) {
		return null;
	}
	return (
		<p className="text-destructive text-sm" role="alert">
			{state.error.message}
		</p>
	);
}
