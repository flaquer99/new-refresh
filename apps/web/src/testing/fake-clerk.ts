import { vi } from "vitest";

export type FakeClerkState =
	| { kind: "signed-out" }
	| { kind: "pending"; userId: string }
	| { kind: "member"; userId: string; organizationId: string }
	| { kind: "admin"; userId: string; organizationId: string };

export const TEST_USER_ID = "user_test";
export const TEST_ORGANIZATION_ID = "org_test";

export const fakeClerkStates = {
	signedOut: { kind: "signed-out" },
	pending: { kind: "pending", userId: TEST_USER_ID },
	member: {
		kind: "member",
		userId: TEST_USER_ID,
		organizationId: TEST_ORGANIZATION_ID,
	},
	admin: {
		kind: "admin",
		userId: TEST_USER_ID,
		organizationId: TEST_ORGANIZATION_ID,
	},
	outsiderAdmin: {
		kind: "admin",
		userId: "user_outsider",
		organizationId: "org_other",
	},
} as const satisfies Record<string, FakeClerkState>;

export const buildAuthObject = (
	state: FakeClerkState,
	redirectToSignIn: () => unknown,
) => {
	const base = { userId: null, orgId: null, orgRole: null, redirectToSignIn };
	if (state.kind === "signed-out") {
		return base;
	}
	if (state.kind === "pending") {
		return { ...base, userId: state.userId };
	}
	return {
		...base,
		userId: state.userId,
		orgId: state.organizationId,
		orgRole: state.kind === "admin" ? "org:admin" : "org:member",
	};
};

export const fakeClerkServer = () => ({
	auth: vi.fn(),
	currentUser: vi.fn(),
	clerkClient: vi.fn(),
});

export const setAuthState = (
	auth: ReturnType<typeof vi.fn>,
	state: FakeClerkState,
) => {
	const redirectToSignIn = vi.fn();
	auth.mockResolvedValue(buildAuthObject(state, redirectToSignIn));
	return { redirectToSignIn };
};
