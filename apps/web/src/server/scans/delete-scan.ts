import "server-only";
import type { DeleteOutcome } from "@refresh/db/scan-store-types";
import {
	SCAN_STILL_RUNNING_MESSAGE,
	type ScanError,
} from "@refresh/scan-contracts/errors";
import {
	ORGANIZATION_REQUIRED_MESSAGE,
	UNAUTHORIZED_MESSAGE,
} from "../auth/auth-constants";
import { canManageScan } from "../auth/can-manage-scan";
import {
	type ActorFailureCode,
	getScanActor,
	type ScanActor,
} from "../auth/get-scan-actor";
import { getScanStore } from "../db/scan-store";
import { SCAN_NOT_FOUND_MESSAGE } from "./scan-not-found";
import { logStoreFailure, STORE_UNAVAILABLE_MESSAGE } from "./store-errors";

export type DeleteScanState = { ok: true } | { ok: false; error: ScanError };

const DELETE_FORBIDDEN_MESSAGE =
	"Only admins can delete scans started by someone else.";

const refusal = (error: ScanError): DeleteScanState => ({ ok: false, error });

const DELETE_RESULTS: Record<DeleteOutcome, DeleteScanState> = {
	deleted: { ok: true },
	running: refusal({
		code: "SCAN_STILL_RUNNING",
		message: SCAN_STILL_RUNNING_MESSAGE,
	}),
	"not-found": refusal({
		code: "SCAN_NOT_FOUND",
		message: SCAN_NOT_FOUND_MESSAGE,
	}),
};

const STORE_UNAVAILABLE = refusal({
	code: "INTERNAL_ERROR",
	message: STORE_UNAVAILABLE_MESSAGE,
});

const ACTOR_REFUSALS: Record<ActorFailureCode, DeleteScanState> = {
	UNAUTHORIZED: refusal({
		code: "UNAUTHORIZED",
		message: UNAUTHORIZED_MESSAGE,
	}),
	ORGANIZATION_REQUIRED: refusal({
		code: "ORGANIZATION_REQUIRED",
		message: ORGANIZATION_REQUIRED_MESSAGE,
	}),
};

const FORBIDDEN = refusal({
	code: "FORBIDDEN",
	message: DELETE_FORBIDDEN_MESSAGE,
});

const deleteOwned = async (
	scanId: string,
	actor: ScanActor,
): Promise<DeleteScanState> => {
	const store = getScanStore();
	const key = { scanId, organizationId: actor.organizationId };
	const stored = await store.get(key);
	if (!stored) {
		return DELETE_RESULTS["not-found"];
	}
	if (!canManageScan(actor, stored)) {
		return FORBIDDEN;
	}
	return DELETE_RESULTS[await store.deleteFinished(key)];
};

export const deleteScan = async (scanId: string): Promise<DeleteScanState> => {
	const result = await getScanActor();
	if (!result.ok) {
		return ACTOR_REFUSALS[result.code];
	}
	try {
		return await deleteOwned(scanId, result.actor);
	} catch (error) {
		logStoreFailure("deleteFinished", error);
		return STORE_UNAVAILABLE;
	}
};
