import { CLERK_API_ORIGIN, requireClerkKeys } from "./clerk-env";

type ClerkMethod = "GET" | "POST" | "DELETE";

export const clerkRequest = async <T>(
	method: ClerkMethod,
	path: string,
	body?: unknown,
): Promise<T> => {
	const { secretKey } = requireClerkKeys();
	const response = await fetch(`${CLERK_API_ORIGIN}${path}`, {
		method,
		headers: {
			Authorization: `Bearer ${secretKey}`,
			"Content-Type": "application/json",
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
	if (!response.ok) {
		throw new Error(
			`Clerk ${method} ${path} failed with ${response.status}: ${await response.text()}`,
		);
	}
	return (await response.json()) as T;
};
