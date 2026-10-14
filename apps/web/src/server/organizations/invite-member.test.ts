import { clerkClient } from "@clerk/nextjs/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TEST_ORGANIZATION_ID, TEST_USER_ID } from "../../testing/fake-clerk";
import { spyOnServerLog } from "../../testing/server-log-spy";
import type { ScanActor } from "../auth/get-scan-actor";
import { inviteMember } from "./invite-member";

vi.mock("@clerk/nextjs/server", () => ({ clerkClient: vi.fn() }));
vi.mock("next/headers", () => ({
	headers: vi
		.fn()
		.mockResolvedValue(
			new Headers({ host: "refresh.test", "x-forwarded-proto": "https" }),
		),
}));

const admin: ScanActor = {
	userId: TEST_USER_ID,
	organizationId: TEST_ORGANIZATION_ID,
	role: "admin",
};
const member: ScanActor = { ...admin, role: "member" };

const clerk = {
	users: { getUserList: vi.fn(), getOrganizationMembershipList: vi.fn() },
	organizations: { createOrganizationInvitation: vi.fn() },
};

describe("inviteMember", () => {
	beforeEach(() => {
		vi.mocked(clerkClient).mockResolvedValue(
			clerk as unknown as Awaited<ReturnType<typeof clerkClient>>,
		);
		clerk.users.getUserList.mockResolvedValue({ data: [] });
		clerk.users.getOrganizationMembershipList.mockResolvedValue({ data: [] });
		clerk.organizations.createOrganizationInvitation.mockResolvedValue({});
	});

	it("creates an invitation with the chosen role and the join redirect", async () => {
		// GIVEN / WHEN
		const state = await inviteMember({
			actor: admin,
			email: " Ana@Client.com ",
			role: "org:admin",
		});

		// THEN
		expect(state).toEqual({
			status: "sent",
			email: "ana@client.com",
			fieldError: null,
			formError: null,
		});
		expect(
			clerk.organizations.createOrganizationInvitation,
		).toHaveBeenCalledWith({
			organizationId: TEST_ORGANIZATION_ID,
			inviterUserId: TEST_USER_ID,
			emailAddress: "ana@client.com",
			role: "org:admin",
			redirectUrl: "https://refresh.test/join",
		});
	});

	it("defaults the role to member", async () => {
		// GIVEN / WHEN
		await inviteMember({ actor: admin, email: "ana@client.com", role: null });

		// THEN
		expect(
			clerk.organizations.createOrganizationInvitation,
		).toHaveBeenCalledWith(expect.objectContaining({ role: "org:member" }));
	});

	it("refuses an invitee who already belongs to an organization", async () => {
		// GIVEN
		clerk.users.getUserList.mockResolvedValue({ data: [{ id: "user_ana" }] });
		clerk.users.getOrganizationMembershipList.mockResolvedValue({
			data: [{ id: "mem_1" }],
		});

		// WHEN
		const state = await inviteMember({
			actor: admin,
			email: "ana@client.com",
			role: "org:member",
		});

		// THEN
		expect(state.fieldError).toBe(
			"ana@client.com already belongs to another organization. A person can only belong to one organization.",
		);
		expect(
			clerk.organizations.createOrganizationInvitation,
		).not.toHaveBeenCalled();
	});

	it("invites a known user who has no organization", async () => {
		// GIVEN
		clerk.users.getUserList.mockResolvedValue({ data: [{ id: "user_ana" }] });

		// WHEN
		const state = await inviteMember({
			actor: admin,
			email: "ana@client.com",
			role: "org:member",
		});

		// THEN
		expect(state.status).toBe("sent");
	});

	it("refuses non-admin actors", async () => {
		// GIVEN / WHEN
		const state = await inviteMember({
			actor: member,
			email: "ana@client.com",
			role: "org:member",
		});

		// THEN
		expect(state.formError).toBe("Only admins can invite members.");
		expect(clerk.users.getUserList).not.toHaveBeenCalled();
	});

	it("rejects an invalid email", async () => {
		// GIVEN / WHEN
		const state = await inviteMember({
			actor: admin,
			email: "not-an-email",
			role: "org:member",
		});

		// THEN
		expect(state.fieldError).toBe("Enter a valid email address.");
	});

	it("rejects an unknown role", async () => {
		// GIVEN / WHEN
		const state = await inviteMember({
			actor: admin,
			email: "ana@client.com",
			role: "org:owner",
		});

		// THEN
		expect(state.formError).toBe("Choose a valid role.");
	});

	it("reports a pending duplicate invitation", async () => {
		// GIVEN
		clerk.organizations.createOrganizationInvitation.mockRejectedValue({
			status: 422,
			errors: [{ code: "duplicate_record" }],
		});

		// WHEN
		const state = await inviteMember({
			actor: admin,
			email: "ana@client.com",
			role: "org:member",
		});

		// THEN
		expect(state.fieldError).toBe(
			"ana@client.com already has a pending invitation.",
		);
	});

	it("reports a rate limit as retryable without logging the email", async () => {
		// GIVEN
		const logs = spyOnServerLog();
		clerk.organizations.createOrganizationInvitation.mockRejectedValue({
			status: 429,
		});

		// WHEN
		const state = await inviteMember({
			actor: admin,
			email: "ana@client.com",
			role: "org:member",
		});

		// THEN
		expect(state.formError).toBe(
			"Couldn't send the invitation. Try again in a minute.",
		);
		expect(JSON.stringify(logs())).not.toContain("ana@client.com");
	});

	it("reports a Clerk outage as retryable and logs Clerk IDs", async () => {
		// GIVEN
		const logs = spyOnServerLog();
		clerk.users.getUserList.mockRejectedValue(new Error("down"));

		// WHEN
		const state = await inviteMember({
			actor: admin,
			email: "ana@client.com",
			role: "org:member",
		});

		// THEN
		expect(state.formError).toBe(
			"Couldn't send the invitation. Try again in a minute.",
		);
		expect(logs()).toEqual([
			expect.objectContaining({
				event: "organization.invite_failed",
				userId: TEST_USER_ID,
				organizationId: TEST_ORGANIZATION_ID,
				rateLimited: false,
			}),
		]);
	});
});
