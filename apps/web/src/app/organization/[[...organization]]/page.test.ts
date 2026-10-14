import { OrganizationProfile } from "@clerk/nextjs";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { InviteMemberForm } from "@/components/organization/invite-member-form";
import { requirePageActor } from "@/server/auth/require-page-actor";
import OrganizationPage from "./page";

vi.mock("@clerk/nextjs", () => ({ OrganizationProfile: vi.fn() }));
vi.mock("@/server/auth/require-page-actor", () => ({
	requirePageActor: vi.fn(),
}));
vi.mock("@/components/organization/invite-member-form", () => ({
	InviteMemberForm: vi.fn(),
}));

const childTypes = (page: unknown) =>
	[(page as ReactElement<{ children: unknown }>).props.children]
		.flat()
		.map((child) => (child as ReactElement | null)?.type ?? null);

describe("organization page", () => {
	it("shows the invite form and the profile to admins", async () => {
		// GIVEN
		vi.mocked(requirePageActor).mockResolvedValue({
			userId: "u",
			organizationId: "o",
			role: "admin",
		});

		// WHEN
		const page = await OrganizationPage();

		// THEN
		expect(childTypes(page)).toEqual([InviteMemberForm, OrganizationProfile]);
	});

	it("hides the invite form for members", async () => {
		// GIVEN
		vi.mocked(requirePageActor).mockResolvedValue({
			userId: "u",
			organizationId: "o",
			role: "member",
		});

		// WHEN
		const page = await OrganizationPage();

		// THEN
		expect(childTypes(page)).toEqual([null, OrganizationProfile]);
	});

	it("hides Clerk's built-in invite button", async () => {
		// GIVEN
		vi.mocked(requirePageActor).mockResolvedValue({
			userId: "u",
			organizationId: "o",
			role: "member",
		});

		// WHEN
		const page = await OrganizationPage();

		// THEN
		const profile = (
			page as ReactElement<{
				children: ReactElement<{ appearance: unknown }>[];
			}>
		).props.children[1];
		expect(profile.props.appearance).toEqual({
			elements: { membersPageInviteButton: { display: "none" } },
		});
	});
});
