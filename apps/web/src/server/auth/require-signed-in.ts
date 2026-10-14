import "server-only";
import { auth } from "@clerk/nextjs/server";

export const requireSignedIn = async (): Promise<string> => {
	const { userId, redirectToSignIn } = await auth();
	if (userId) {
		return userId;
	}
	return redirectToSignIn();
};
