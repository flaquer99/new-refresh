import { useState } from "react";

type CancelScanButtonProps = {
	onCancel: () => void;
};

export function CancelScanButton({ onCancel }: CancelScanButtonProps) {
	const [isCancelling, setIsCancelling] = useState(false);
	const cancel = () => {
		setIsCancelling(true);
		onCancel();
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
