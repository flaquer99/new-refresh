import { auth } from "@clerk/nextjs/server";
import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates, setAuthState } from "../../testing/fake-clerk";
import { requireApiActor } from "./require-api-actor";

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

const authMock = vi.mocked(auth) as unknown as ReturnType<typeof vi.fn>;

const failureOf = async (
	result: Awaited<ReturnType<typeof requireApiActor>>,
) => {
	if (result.ok) {
		throw new Error("expected a failure result");
	}
	return {
		status: result.response.status,
		body: await result.response.json(),
	};
};

describe("requireApiActor", () => {
	it("answers 401 UNAUTHORIZED when signed out", async () => {
		setAuthState(authMock, fakeClerkStates.signedOut);

		const failure = await failureOf(await requireApiActor());

		expect(failure).toEqual({
			status: 401,
			body: {
				error: { code: "UNAUTHORIZED", message: "Sign in to continue." },
			},
		});
	});

	it("answers 403 ORGANIZATION_REQUIRED without an organization", async () => {
		setAuthState(authMock, fakeClerkStates.pending);

		const failure = await failureOf(await requireApiActor());

		expect(failure.status).toBe(403);
		expect(failure.body.error.code).toBe("ORGANIZATION_REQUIRED");
	});

	it("returns the actor when signed in with an organization", async () => {
		setAuthState(authMock, fakeClerkStates.admin);

		const result = await requireApiActor();

		expect(result).toEqual({
			ok: true,
			actor: { userId: "user_test", organizationId: "org_test", role: "admin" },
		});
	});
});
