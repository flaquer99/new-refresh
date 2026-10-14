import { auth } from "@clerk/nextjs/server";
import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates, setAuthState } from "../../testing/fake-clerk";
import { getScanActor } from "./get-scan-actor";

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

const authMock = vi.mocked(auth) as unknown as ReturnType<typeof vi.fn>;

describe("getScanActor", () => {
	it("returns UNAUTHORIZED when signed out", async () => {
		setAuthState(authMock, fakeClerkStates.signedOut);

		const result = await getScanActor();

		expect(result).toEqual({ ok: false, code: "UNAUTHORIZED" });
	});

	it("returns ORGANIZATION_REQUIRED without an active organization", async () => {
		setAuthState(authMock, fakeClerkStates.pending);

		const result = await getScanActor();

		expect(result).toEqual({ ok: false, code: "ORGANIZATION_REQUIRED" });
	});

	it("maps org:admin to admin", async () => {
		setAuthState(authMock, fakeClerkStates.admin);

		const result = await getScanActor();

		expect(result).toEqual({
			ok: true,
			actor: { userId: "user_test", organizationId: "org_test", role: "admin" },
		});
	});

	it("maps other roles to member", async () => {
		setAuthState(authMock, fakeClerkStates.member);

		const result = await getScanActor();

		expect(result).toEqual({
			ok: true,
			actor: {
				userId: "user_test",
				organizationId: "org_test",
				role: "member",
			},
		});
	});
});
