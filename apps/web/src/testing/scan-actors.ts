import type { ScanActor } from "@/server/auth/get-scan-actor";
import { TEST_ORGANIZATION_ID, TEST_USER_ID } from "./fake-clerk";

export const MEMBER_ACTOR: ScanActor = {
	userId: TEST_USER_ID,
	organizationId: TEST_ORGANIZATION_ID,
	role: "member",
};

export const ADMIN_ACTOR: ScanActor = {
	userId: "user_admin",
	organizationId: TEST_ORGANIZATION_ID,
	role: "admin",
};

export const OTHER_MEMBER_ACTOR: ScanActor = {
	userId: "user_other",
	organizationId: TEST_ORGANIZATION_ID,
	role: "member",
};
