import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates, setAuthState } from "../../testing/fake-clerk";
import { requirePageActor } from "./require-page-actor";

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

const authMock = vi.mocked(auth) as unknown as ReturnType<typeof vi.fn>;

describe("requirePageActor", () => {
	it("redirects signed-out requests to sign-in with the return URL", async () => {
		const { redirectToSignIn } = setAuthState(
			authMock,
			fakeClerkStates.signedOut,
		);

		await requirePageActor();

		expect(redirectToSignIn).toHaveBeenCalledTimes(1);
	});

	it("redirects a pending session to onboarding", async () => {
		setAuthState(authMock, fakeClerkStates.pending);

		await requirePageActor();

		expect(redirect).toHaveBeenCalledWith("/onboarding");
	});

	it("returns the actor for a member with an organization", async () => {
		setAuthState(authMock, fakeClerkStates.member);

		const actor = await requirePageActor();

		expect(actor).toEqual({
			userId: "user_test",
			organizationId: "org_test",
			role: "member",
		});
	});
});
