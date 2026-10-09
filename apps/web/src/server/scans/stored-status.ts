import type { StoredScan } from "@refresh/db/scan-store-types";
import type { ScanStatus } from "@refresh/scan-contracts/scan-status";

export const toScanStatus = (stored: StoredScan): ScanStatus => {
	const pages = stored.report?.summary.pagesScanned ?? 0;
	return {
		scanId: stored.scanId,
		status: stored.status,
		progress: { pagesScanned: pages, pagesDiscovered: pages, currentUrl: null },
		report: stored.report,
		error: stored.error,
	};
};
