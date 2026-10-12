export const NEW_SCAN_PATH = "/";
export const HISTORY_PATH = "/scans";

export const scanLinkPath = (scanId: string): string =>
	`${HISTORY_PATH}/${encodeURIComponent(scanId)}`;

export const olderScansPath = (before: string): string =>
	`${HISTORY_PATH}?${new URLSearchParams({ before })}`;
