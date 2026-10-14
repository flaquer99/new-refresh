import { clerkClient } from "@clerk/nextjs/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { spyOnServerLog } from "../../testing/server-log-spy";
import { handleClerkWebhook } from "./handle-clerk-webhook";

vi.mock("@clerk/nextjs/server", () => ({ clerkClient: vi.fn() }));
vi.mock("@clerk/nextjs/webhooks", () => ({ verifyWebhook: vi.fn() }));

const deleteByOrganization = vi.fn();
vi.mock("../db/scan-store", () => ({
	getScanStore: () => ({ deleteByOrganization }),
}));

const clerk = {
	users: { getOrganizationMembershipList: vi.fn() },
	organizations: { deleteOrganizationMembership: vi.fn() },
};

const membership = (organizationId: string, createdAt: number) => ({
	createdAt,
	organization: { id: organizationId },
});

const membershipEvent = {
	type: "organizationMembership.created",
	data: { public_user_data: { user_id: "user_1" } },
};

const request = () =>
	new NextRequest("http://refresh.test/api/webhooks/clerk", {
		method: "POST",
		headers: { "svix-id": "msg_1" },
		body: "{}",
	});

const deliver = (event: object) => {
	vi.mocked(verifyWebhook).mockResolvedValue(
		event as Awaited<ReturnType<typeof verifyWebhook>>,
	);
	return handleClerkWebhook(request());
};

describe("handleClerkWebhook", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(clerkClient).mockResolvedValue(
			clerk as unknown as Awaited<ReturnType<typeof clerkClient>>,
		);
		clerk.organizations.deleteOrganizationMembership.mockResolvedValue({});
		deleteByOrganization.mockResolvedValue(2);
	});

	it("answers 400 on an invalid signature", async () => {
		// GIVEN
		spyOnServerLog();
		vi.mocked(verifyWebhook).mockRejectedValue(new Error("bad signature"));

		// WHEN
		const response = await handleClerkWebhook(request());

		// THEN
		expect(response.status).toBe(400);
		expect((await response.json()).error.code).toBe("INVALID_WEBHOOK");
	});

	it("removes the newer of two memberships and keeps the oldest", async () => {
		// GIVEN
		const logs = spyOnServerLog();
		clerk.users.getOrganizationMembershipList.mockResolvedValue({
			data: [membership("org_new", 200), membership("org_old", 100)],
		});

		// WHEN
		const response = await deliver(membershipEvent);

		// THEN
		expect(await response.json()).toEqual({ handled: true });
		expect(
			clerk.organizations.deleteOrganizationMembership,
		).toHaveBeenCalledExactlyOnceWith({
			organizationId: "org_new",
			userId: "user_1",
		});
		expect(logs()).toContainEqual(
			expect.objectContaining({
				event: "auth.extra_membership_removed",
				organizationId: "org_new",
			}),
		);
	});

	it("does nothing for a single membership on redelivery", async () => {
		// GIVEN
		clerk.users.getOrganizationMembershipList.mockResolvedValue({
			data: [membership("org_old", 100)],
		});

		// WHEN
		const response = await deliver(membershipEvent);

		// THEN
		expect(response.status).toBe(200);
		expect(
			clerk.organizations.deleteOrganizationMembership,
		).not.toHaveBeenCalled();
	});

	it("purges the organization's scans when it is deleted", async () => {
		// GIVEN
		const logs = spyOnServerLog();

		// WHEN
		const response = await deliver({
			type: "organization.deleted",
			data: { id: "org_gone", deleted: true },
		});

		// THEN
		expect(await response.json()).toEqual({ handled: true });
		expect(deleteByOrganization).toHaveBeenCalledExactlyOnceWith("org_gone");
		expect(logs()).toContainEqual(
			expect.objectContaining({
				event: "scan.organization_purged",
				removed: 2,
			}),
		);
	});

	it("ignores unsubscribed event types", async () => {
		// GIVEN / WHEN
		const response = await deliver({ type: "user.created", data: {} });

		// THEN
		expect(await response.json()).toEqual({ handled: false });
		expect(deleteByOrganization).not.toHaveBeenCalled();
	});

	it("answers 500 when the Backend API fails so Svix retries", async () => {
		// GIVEN
		spyOnServerLog();
		clerk.users.getOrganizationMembershipList.mockRejectedValue(
			new Error("clerk down"),
		);

		// WHEN
		const response = await deliver(membershipEvent);

		// THEN
		expect(response.status).toBe(500);
		expect((await response.json()).error.code).toBe("INTERNAL_ERROR");
	});

	it("answers 500 when the store fails", async () => {
		// GIVEN
		spyOnServerLog();
		deleteByOrganization.mockRejectedValue(new Error("db down"));

		// WHEN
		const response = await deliver({
			type: "organization.deleted",
			data: { id: "org_gone" },
		});

		// THEN
		expect(response.status).toBe(500);
	});
});
