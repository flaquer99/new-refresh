import { auth, currentUser } from "@clerk/nextjs/server";
import { beforeEach, vi } from "vitest";
import {
	type FakeClerkState,
	fakeClerkStates,
	setAuthState,
} from "./fake-clerk";

export const STARTER_NAME = "Ana Souza";

type AuthMock = ReturnType<typeof vi.fn>;

export const signInAs = (state: FakeClerkState) =>
	setAuthState(vi.mocked(auth) as unknown as AuthMock, state);

export const useFakeClerk = (
	initial: FakeClerkState = fakeClerkStates.member,
) => {
	beforeEach(() => {
		signInAs(initial);
		vi.mocked(currentUser as unknown as AuthMock).mockResolvedValue({
			fullName: STARTER_NAME,
			primaryEmailAddress: null,
		});
	});
};
