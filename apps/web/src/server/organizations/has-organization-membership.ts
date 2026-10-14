import "server-only";
import { clerkClient } from "@clerk/nextjs/server";

export const hasOrganizationMembership = async (
	email: string,
): Promise<boolean> => {
	const client = await clerkClient();
	const { data: users } = await client.users.getUserList({
		emailAddress: [email],
	});
	for (const user of users) {
		const { data: memberships } =
			await client.users.getOrganizationMembershipList({ userId: user.id });
		if (memberships.length > 0) {
			return true;
		}
	}
	return false;
};
