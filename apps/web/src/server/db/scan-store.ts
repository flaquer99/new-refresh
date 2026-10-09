import "server-only";
import { createScanStore } from "@refresh/db/scan-store";
import type { ScanStore } from "@refresh/db/scan-store-types";
import { logServerEvent } from "../log/server-log";

const MISSING_DATABASE_URL =
	"DATABASE_URL is not set, so the web app cannot store scans.";

const holder = globalThis as unknown as { refreshScanStore?: ScanStore };

const openScanStore = (): ScanStore => {
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error(MISSING_DATABASE_URL);
	}
	return createScanStore({
		databaseUrl,
		onUnreadableReport: (scanId) =>
			logServerEvent("error", { event: "scan.report_unreadable", scanId }),
	});
};

export const getScanStore = (): ScanStore => {
	holder.refreshScanStore ??= openScanStore();
	return holder.refreshScanStore;
};

export const closeScanStore = async (): Promise<void> => {
	const store = holder.refreshScanStore;
	holder.refreshScanStore = undefined;
	await store?.close();
};
