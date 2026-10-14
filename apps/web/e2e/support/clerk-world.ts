import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { deleteOrganization, deleteUser } from "./clerk-cleanup";
import {
	addMember,
	createOrganization,
	createTestUser,
	type TestOrganization,
	type TestUser,
} from "./clerk-users";

export type World = {
	organization: TestOrganization;
	admin: TestUser;
	member: TestUser;
	outsiderOrganization: TestOrganization;
	outsider: TestUser;
};

const WORLD_FILE = resolve("e2e/.clerk/world.json");

export const createWorld = async (): Promise<World> => {
	const admin = await createTestUser("admin", "Admin");
	const organization = await createOrganization(admin, "primary");
	const member = await addMember(
		organization.id,
		await createTestUser("member", "Member"),
	);
	const outsiderBase = await createTestUser("outsider", "Outsider");
	const outsiderOrganization = await createOrganization(outsiderBase, "other");
	const world: World = {
		organization,
		admin: { ...admin, organizationId: organization.id },
		member,
		outsiderOrganization,
		outsider: { ...outsiderBase, organizationId: outsiderOrganization.id },
	};
	mkdirSync(dirname(WORLD_FILE), { recursive: true });
	writeFileSync(WORLD_FILE, JSON.stringify(world));
	return world;
};

export const readWorld = (): World =>
	JSON.parse(readFileSync(WORLD_FILE, "utf8")) as World;

export const destroyWorld = async (): Promise<void> => {
	const world = readWorld();
	await deleteOrganization(world.organization.id);
	await deleteOrganization(world.outsiderOrganization.id);
	for (const user of [world.admin, world.member, world.outsider]) {
		await deleteUser(user.id);
	}
	rmSync(WORLD_FILE, { force: true });
};
