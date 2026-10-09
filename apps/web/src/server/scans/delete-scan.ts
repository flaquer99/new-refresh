import "server-only";
import type { DeleteOutcome } from "@refresh/db/scan-store-types";
import {
	SCAN_STILL_RUNNING_MESSAGE,
	type ScanError,
} from "@refresh/scan-contracts/errors";
import { getScanStore } from "../db/scan-store";
import { SCAN_NOT_FOUND_MESSAGE } from "./read-scan-status";
import { logStoreFailure, STORE_UNAVAILABLE_MESSAGE } from "./store-errors";

export type DeleteScanState = { ok: true } | { ok: false; error: ScanError };

const DELETE_RESULTS: Record<DeleteOutcome, DeleteScanState> = {
	deleted: { ok: true },
	running: {
		ok: false,
		error: { code: "SCAN_STILL_RUNNING", message: SCAN_STILL_RUNNING_MESSAGE },
	},
	"not-found": {
		ok: false,
		error: { code: "SCAN_NOT_FOUND", message: SCAN_NOT_FOUND_MESSAGE },
	},
};

const STORE_UNAVAILABLE: DeleteScanState = {
	ok: false,
	error: { code: "INTERNAL_ERROR", message: STORE_UNAVAILABLE_MESSAGE },
};

export const deleteScan = async (scanId: string): Promise<DeleteScanState> => {
	try {
		return DELETE_RESULTS[await getScanStore().deleteFinished(scanId)];
	} catch (error) {
		logStoreFailure("deleteFinished", error);
		return STORE_UNAVAILABLE;
	}
};
