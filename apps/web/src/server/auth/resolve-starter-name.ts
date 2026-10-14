import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { errorNameOf, logServerEvent } from "../log/server-log";
import { STARTER_NAME_UNAVAILABLE_EVENT } from "./auth-constants";

export const resolveStarterName = async (): Promise<string | null> => {
	try {
		const user = await currentUser();
		return (
			user?.fullName?.trim() || user?.primaryEmailAddress?.emailAddress || null
		);
	} catch (error) {
		logServerEvent("warn", {
			event: STARTER_NAME_UNAVAILABLE_EVENT,
			error: errorNameOf(error),
		});
		return null;
	}
};
