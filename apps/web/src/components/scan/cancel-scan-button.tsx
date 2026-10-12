import { useState } from "react";
import { Button } from "@/components/ui/button";

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
		<Button
			className="self-start"
			disabled={isCancelling}
			onClick={cancel}
			type="button"
			variant="outline"
		>
			{isCancelling ? "Cancelling…" : "Cancel scan"}
		</Button>
	);
}
