import { describe, expect, it, vi } from "vitest";
import { INITIAL_INVITE_STATE } from "@/lib/organizations/invite-member-state";
import { getScanActor } from "@/server/auth/get-scan-actor";
import { inviteMember } from "@/server/organizations/invite-member";
import { inviteMemberAction } from "./actions";

vi.mock("@/server/auth/get-scan-actor", () => ({ getScanActor: vi.fn() }));
vi.mock("@/server/organizations/invite-member", () => ({
	inviteMember: vi.fn(),
}));

const formWith = (email: string, role: string) => {
	const formData = new FormData();
	formData.set("email", email);
	formData.set("role", role);
	return formData;
};

describe("inviteMemberAction", () => {
	it("passes the actor and form values to inviteMember", async () => {
		// GIVEN
		const actor = { userId: "u", organizationId: "o", role: "admin" } as const;
		vi.mocked(getScanActor).mockResolvedValue({ ok: true, actor });
		vi.mocked(inviteMember).mockResolvedValue(INITIAL_INVITE_STATE);

		// WHEN
		const state = await inviteMemberAction(
			INITIAL_INVITE_STATE,
			formWith("ana@client.com", "org:admin"),
		);

		// THEN
		expect(inviteMember).toHaveBeenCalledWith({
			actor,
			email: "ana@client.com",
			role: "org:admin",
		});
		expect(state).toBe(INITIAL_INVITE_STATE);
	});

	it("refuses a signed-out caller", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "UNAUTHORIZED",
		});

		// WHEN
		const state = await inviteMemberAction(
			INITIAL_INVITE_STATE,
			formWith("ana@client.com", "org:member"),
		);

		// THEN
		expect(state.formError).toBe("Sign in to continue.");
	});

	it("refuses a caller without an organization", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "ORGANIZATION_REQUIRED",
		});

		// WHEN
		const state = await inviteMemberAction(
			INITIAL_INVITE_STATE,
			formWith("ana@client.com", "org:member"),
		);

		// THEN
		expect(state.formError).toBe("Join or create an organization to continue.");
	});
});
