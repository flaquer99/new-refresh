import "server-only";
import { getScanStore } from "../db/scan-store";
import { logServerEvent } from "../log/server-log";

export const purgeOrganizationScans = async (
	organizationId: string,
): Promise<void> => {
	const removed = await getScanStore().deleteByOrganization(organizationId);
	logServerEvent("warn", {
		event: "scan.organization_purged",
		organizationId,
		removed,
	});
};
