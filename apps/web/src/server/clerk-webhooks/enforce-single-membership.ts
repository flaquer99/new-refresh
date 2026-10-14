import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { logServerEvent } from "../log/server-log";

export const enforceSingleMembership = async (
	userId: string,
): Promise<void> => {
	const client = await clerkClient();
	const { data: memberships } =
		await client.users.getOrganizationMembershipList({ userId });
	if (memberships.length <= 1) {
		return;
	}
	const [, ...extras] = [...memberships].sort(
		(a, b) => a.createdAt - b.createdAt,
	);
	for (const extra of extras) {
		await client.organizations.deleteOrganizationMembership({
			organizationId: extra.organization.id,
			userId,
		});
		logServerEvent("warn", {
			event: "auth.extra_membership_removed",
			userId,
			organizationId: extra.organization.id,
		});
	}
};
