const DOT = /\./g;

export const scanPath = (scanId: string): string =>
	`/scans/${encodeURIComponent(scanId).replace(DOT, "%2E")}`;
