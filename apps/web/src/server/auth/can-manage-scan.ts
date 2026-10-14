import type { ScanOwner } from "@refresh/db/scan-store-types";
import type { ScanActor } from "./get-scan-actor";

export type ScanOwnership = Pick<
	ScanOwner,
	"organizationId" | "startedByUserId"
>;

export const canManageScan = (
	actor: ScanActor,
	scan: ScanOwnership,
): boolean => {
	if (actor.organizationId !== scan.organizationId) {
		return false;
	}
	return actor.role === "admin" || actor.userId === scan.startedByUserId;
};
