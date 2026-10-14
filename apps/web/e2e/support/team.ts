import { deleteOrganization, deleteUser } from "./clerk-cleanup";
import {
	addMember,
	createOrganization,
	createTestUser,
	type TestOrganization,
	type TestUser,
} from "./clerk-users";

export type Team = {
	organization: TestOrganization;
	admin: TestUser;
	member: TestUser;
};

export const createTeam = async (): Promise<Team> => {
	const admin = await createTestUser("team-admin", "Admin");
	const organization = await createOrganization(admin, "team");
	const member = await addMember(
		organization.id,
		await createTestUser("team-member", "Member"),
	);
	return {
		organization,
		admin: { ...admin, organizationId: organization.id },
		member,
	};
};

export const destroyTeam = async (team: Team): Promise<void> => {
	await deleteOrganization(team.organization.id);
	await deleteUser(team.admin.id);
	await deleteUser(team.member.id);
};
