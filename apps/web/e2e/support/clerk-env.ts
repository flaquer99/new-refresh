const MISSING_KEYS_MESSAGE =
	"E2E needs a Clerk development instance. Set E2E_CLERK_PUBLISHABLE_KEY and E2E_CLERK_SECRET_KEY before running the Playwright suite.";

export const E2E_USER_PASSWORD = "Refresh-E2e-Pass-7391!";
export const VERIFICATION_CODE = "424242";
export const CLERK_API_ORIGIN = "https://api.clerk.com/v1";

export const requireClerkKeys = (): {
	publishableKey: string;
	secretKey: string;
} => {
	const publishableKey = process.env.E2E_CLERK_PUBLISHABLE_KEY;
	const secretKey = process.env.E2E_CLERK_SECRET_KEY;
	if (!(publishableKey && secretKey)) {
		throw new Error(MISSING_KEYS_MESSAGE);
	}
	return { publishableKey, secretKey };
};

export const clerkServerEnv = (): Record<string, string> => {
	const { publishableKey, secretKey } = requireClerkKeys();
	return {
		NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: publishableKey,
		CLERK_SECRET_KEY: secretKey,
		NEXT_PUBLIC_CLERK_SIGN_IN_URL: "/sign-in",
		NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/sign-up",
		NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL: "/",
		NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL: "/",
	};
};

export const exposeClerkKeysToTestRunner = (): void => {
	const { publishableKey, secretKey } = requireClerkKeys();
	process.env.CLERK_PUBLISHABLE_KEY = publishableKey;
	process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = publishableKey;
	process.env.CLERK_SECRET_KEY = secretKey;
};
