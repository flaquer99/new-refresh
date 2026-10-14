import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { LandingView } from "@/components/landing/landing-view";
import { HomeHero } from "@/components/scan/home-hero";
import { getScanActor } from "@/server/auth/get-scan-actor";
import Home from "./page";

vi.mock("@clerk/nextjs", () => ({
	SignInButton: vi.fn(),
	SignUpButton: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/server/auth/get-scan-actor", () => ({ getScanActor: vi.fn() }));

const props = { searchParams: Promise.resolve({}) } as unknown as Parameters<
	typeof Home
>[0];

const mainChildren = (page: Awaited<ReturnType<typeof Home>>) => {
	const element = page as unknown as {
		props: { children: { type: unknown } | { type: unknown }[] };
	};
	return [element.props.children].flat().map((child) => child.type);
};

describe("home page", () => {
	it("renders the landing view when signed out", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "UNAUTHORIZED",
		});

		// WHEN
		const page = await Home(props);

		// THEN
		expect(mainChildren(page)).toEqual([LandingView]);
	});

	it("renders the scan hero and form for an actor", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: true,
			actor: { userId: "u", organizationId: "o", role: "member" },
		});

		// WHEN
		const page = await Home(props);

		// THEN
		expect(mainChildren(page)[0]).toBe(HomeHero);
	});

	it("redirects a session without an organization to onboarding", async () => {
		// GIVEN
		vi.mocked(getScanActor).mockResolvedValue({
			ok: false,
			code: "ORGANIZATION_REQUIRED",
		});

		// WHEN
		await Home(props);

		// THEN
		expect(redirect).toHaveBeenCalledWith("/onboarding");
	});
});
