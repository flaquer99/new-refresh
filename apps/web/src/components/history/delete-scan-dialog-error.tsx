import type { DeleteScanState } from "@/server/scans/delete-scan";

type DeleteScanDialogErrorProps = {
	state: DeleteScanState | null;
};

export function DeleteScanDialogError({ state }: DeleteScanDialogErrorProps) {
	if (!state || state.ok) {
		return null;
	}
	return (
		<p className="mt-2 text-destructive" role="alert">
			{state.error.message}
		</p>
	);
}
