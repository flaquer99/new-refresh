import { SignIn, SignUp, UserProfile } from "@clerk/nextjs";
import type { ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { requireSignedIn } from "@/server/auth/require-signed-in";
import AccountPage from "./account/[[...account]]/page";
import SignInPage from "./sign-in/[[...sign-in]]/page";
import SignUpPage from "./sign-up/[[...sign-up]]/page";

vi.mock("@clerk/nextjs", () => ({
	SignIn: vi.fn(),
	SignUp: vi.fn(),
	UserProfile: vi.fn(),
}));
vi.mock("@/server/auth/require-signed-in", () => ({
	requireSignedIn: vi.fn(),
}));

const childOf = (page: unknown) =>
	(page as ReactElement<{ children: ReactElement<Record<string, string>> }>)
		.props.children;

describe("auth pages", () => {
	it("hosts the sign-in component on the sign-in path", () => {
		// WHEN
		const child = childOf(SignInPage());

		// THEN
		expect(child.type).toBe(SignIn);
		expect(child.props.path).toBe("/sign-in");
	});

	it("hosts the sign-up component on the sign-up path", () => {
		// WHEN
		const child = childOf(SignUpPage());

		// THEN
		expect(child.type).toBe(SignUp);
		expect(child.props.path).toBe("/sign-up");
	});

	it("hosts the user profile on the account path for signed-in users", async () => {
		// WHEN
		const child = childOf(await AccountPage());

		// THEN
		expect(requireSignedIn).toHaveBeenCalledTimes(1);
		expect(child.type).toBe(UserProfile);
		expect(child.props.path).toBe("/account");
	});
});
