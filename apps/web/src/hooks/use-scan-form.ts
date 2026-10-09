import type { ScanRequest } from "@refresh/scan-contracts/scan-request";
import { type FormEvent, useState } from "react";
import { useUrlField } from "@/hooks/use-url-field";
import { DEFAULT_DEPTH } from "@/lib/scans/depth-options";

export function useScanForm(
	onSubmit: (request: ScanRequest) => void,
	initialRequest: ScanRequest | null,
) {
	const urlField = useUrlField(initialRequest?.url ?? "");
	const [depth, setDepth] = useState<number>(
		initialRequest?.depth ?? DEFAULT_DEPTH,
	);
	const submit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (urlField.error !== null) {
			urlField.revealError();
			return;
		}
		onSubmit({ url: urlField.url.trim(), depth });
	};
	return {
		url: urlField.url,
		depth,
		urlError: urlField.visibleError,
		urlInputRef: urlField.urlInputRef,
		setUrl: urlField.setUrl,
		setDepth,
		blurUrl: urlField.blurUrl,
		submit,
	};
}
