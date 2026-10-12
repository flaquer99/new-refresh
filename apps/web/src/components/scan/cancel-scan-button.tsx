import { useState } from "react";

type CancelScanButtonProps = {
	onCancel: () => Promise<boolean>;
};

export function CancelScanButton({ onCancel }: CancelScanButtonProps) {
	const [isCancelling, setIsCancelling] = useState(false);
	const cancel = async () => {
		setIsCancelling(true);
		const settled = await onCancel();
		if (!settled) {
			setIsCancelling(false);
		}
	};
	return (
		<button
			className="self-start rounded-md border border-border px-4 py-2 font-medium disabled:opacity-70"
			disabled={isCancelling}
			onClick={cancel}
			type="button"
		>
			{isCancelling ? "Cancelling…" : "Cancel scan"}
		</button>
	);
}
