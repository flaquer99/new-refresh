import "server-only";
import { auth } from "@clerk/nextjs/server";
import { ADMIN_ORG_ROLE } from "./auth-constants";

export type OrganizationRole = "admin" | "member";

export type ScanActor = {
	userId: string;
	organizationId: string;
	role: OrganizationRole;
};

export type ActorFailureCode = "UNAUTHORIZED" | "ORGANIZATION_REQUIRED";

export type ActorResult =
	| { ok: true; actor: ScanActor }
	| { ok: false; code: ActorFailureCode };

export const roleFromOrgRole = (
	orgRole: string | null | undefined,
): OrganizationRole => (orgRole === ADMIN_ORG_ROLE ? "admin" : "member");

export const getScanActor = async (): Promise<ActorResult> => {
	const { userId, orgId, orgRole } = await auth();
	if (!userId) {
		return { ok: false, code: "UNAUTHORIZED" };
	}
	if (!orgId) {
		return { ok: false, code: "ORGANIZATION_REQUIRED" };
	}
	return {
		ok: true,
		actor: { userId, organizationId: orgId, role: roleFromOrgRole(orgRole) },
	};
};
