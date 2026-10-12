export const SCAN_NOT_FOUND_TITLE = "Scan not found";
export const HISTORY_TITLE = "Scan history";
export const OLDER_HISTORY_TITLE = "Scan history — older scans";

export const scanTitle = (startUrl: string | null): string =>
	startUrl === null
		? SCAN_NOT_FOUND_TITLE
		: `Scan of ${new URL(startUrl).host}`;

export const historyTitle = (before: string | null): string =>
	before === null ? HISTORY_TITLE : OLDER_HISTORY_TITLE;
