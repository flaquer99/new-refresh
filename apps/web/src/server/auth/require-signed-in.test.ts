import { auth } from "@clerk/nextjs/server";
import { describe, expect, it, vi } from "vitest";
import { fakeClerkStates, setAuthState } from "../../testing/fake-clerk";
import { requireSignedIn } from "./require-signed-in";

vi.mock("@clerk/nextjs/server", () => ({ auth: vi.fn() }));

const authMock = vi.mocked(auth) as unknown as ReturnType<typeof vi.fn>;

describe("requireSignedIn", () => {
	it("returns the user ID of a signed-in user", async () => {
		// GIVEN
		setAuthState(authMock, fakeClerkStates.pending);

		// WHEN
		const userId = await requireSignedIn();

		// THEN
		expect(userId).toBe("user_test");
	});

	it("redirects signed-out requests to sign-in", async () => {
		// GIVEN
		const { redirectToSignIn } = setAuthState(
			authMock,
			fakeClerkStates.signedOut,
		);

		// WHEN
		await requireSignedIn();

		// THEN
		expect(redirectToSignIn).toHaveBeenCalledTimes(1);
	});
});
