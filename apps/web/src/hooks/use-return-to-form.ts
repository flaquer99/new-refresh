import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { useState } from "react";

export function useReturnToForm(reset: () => void) {
	const [hasReturned, setHasReturned] = useState(false);
	const [draft, setDraft] = useState<ScanRequest | null>(null);
	const returnWith = (nextDraft: ScanRequest | null) => {
		setHasReturned(true);
		setDraft(nextDraft);
		reset();
	};
	return {
		hasReturned,
		draft,
		rememberDraft: setDraft,
		backToForm: () => returnWith(draft),
		startNewScan: () => returnWith(null),
	};
}
