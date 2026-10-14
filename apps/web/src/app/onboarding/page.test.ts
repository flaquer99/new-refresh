import { TaskChooseOrganization } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { getScanActor } from "@/server/auth/get-scan-actor";
import { requireSignedIn } from "@/server/auth/require-signed-in";
import OnboardingPage from "./page";

vi.mock("@clerk/nextjs", () => ({ TaskChooseOrganization: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/auth/get-scan-actor", () => ({ getScanActor: vi.fn() }));
vi.mock("@/server/auth/require-signed-in", () => ({
	requireSignedIn: vi.fn(),
}));

const childOf = (page: unknown) =>
	(page as ReactElement<{ children: ReactElement<Record<string, string>> }>)
		.props.children;

describe("onboarding page", () => {
	it("renders the organization chooser for a session without an organization", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "ORGANIZATION_REQUIRED",
		});

		// WHEN
		const child = childOf(await OnboardingPage());

		// THEN
		expect(child.type).toBe(TaskChooseOrganization);
		expect(child.props.redirectUrlComplete).toBe("/");
	});

	it("sends a user who already has an organization home", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: true,
			actor: { userId: "u", organizationId: "o", role: "member" },
		});

		// WHEN
		await OnboardingPage();

		// THEN
		expect(redirect).toHaveBeenCalledWith("/");
	});

	it("requires a signed-in user", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "ORGANIZATION_REQUIRED",
		});

		// WHEN
		await OnboardingPage();

		// THEN
		expect(requireSignedIn).toHaveBeenCalledTimes(1);
	});
});
