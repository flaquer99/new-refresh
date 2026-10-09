import { ScanUrlSchema } from "@refresh/scan-contracts/scan-request";
import { useRef, useState } from "react";

const validateUrl = (value: string): string | null => {
	const result = ScanUrlSchema.safeParse(value);
	return result.success ? null : (result.error.issues[0]?.message ?? null);
};

export function useUrlField(initialUrl: string) {
	const [url, setUrl] = useState(initialUrl);
	const [showUrlError, setShowUrlError] = useState(false);
	const urlInputRef = useRef<HTMLInputElement>(null);
	const error = validateUrl(url);
	const blurUrl = () => {
		setShowUrlError((shown) => shown || url.trim() !== "");
	};
	const revealError = () => {
		setShowUrlError(true);
		urlInputRef.current?.focus();
	};
	return {
		url,
		setUrl,
		error,
		visibleError: showUrlError ? error : null,
		urlInputRef,
		blurUrl,
		revealError,
	};
}
