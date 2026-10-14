import { SignUp } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { OneOrganizationNotice } from "@/components/organization/one-organization-notice";
import { getScanActor } from "@/server/auth/get-scan-actor";
import JoinPage from "./page";

vi.mock("@clerk/nextjs", () => ({ SignUp: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/auth/get-scan-actor", () => ({ getScanActor: vi.fn() }));

const childOf = (page: unknown) =>
	(page as ReactElement<{ children: ReactElement }>).props.children;

describe("join page", () => {
	it("shows the one-organization message to a user who has an organization", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: true,
			actor: { userId: "u", organizationId: "o", role: "member" },
		});

		// WHEN
		const page = await JoinPage();

		// THEN
		expect(childOf(page).type).toBe(OneOrganizationNotice);
	});

	it("hosts the sign-up component for a signed-out invitee", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "UNAUTHORIZED",
		});

		// WHEN
		const page = await JoinPage();

		// THEN
		expect(childOf(page).type).toBe(SignUp);
	});

	it("sends a signed-in user without an organization to onboarding", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "ORGANIZATION_REQUIRED",
		});

		// WHEN
		await JoinPage();

		// THEN
		expect(redirect).toHaveBeenCalledWith("/onboarding");
	});
});
