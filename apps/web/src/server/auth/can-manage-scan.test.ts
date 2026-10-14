import { describe, expect, it } from "vitest";
import { canManageScan } from "./can-manage-scan";
import type { ScanActor } from "./get-scan-actor";

const member: ScanActor = {
	userId: "user_a",
	organizationId: "org_1",
	role: "member",
};
const admin: ScanActor = { ...member, userId: "user_admin", role: "admin" };

describe("canManageScan", () => {
	it("lets a member manage their own scan", () => {
		const scan = { organizationId: "org_1", startedByUserId: "user_a" };

		expect(canManageScan(member, scan)).toBe(true);
	});

	it("refuses a member on another member's scan", () => {
		const scan = { organizationId: "org_1", startedByUserId: "user_b" };

		expect(canManageScan(member, scan)).toBe(false);
	});

	it("lets an admin manage any scan of the organization", () => {
		const scan = { organizationId: "org_1", startedByUserId: "user_b" };

		expect(canManageScan(admin, scan)).toBe(true);
	});

	it("refuses an admin on a scan of another organization", () => {
		const scan = { organizationId: "org_2", startedByUserId: "user_b" };

		expect(canManageScan(admin, scan)).toBe(false);
	});
});
