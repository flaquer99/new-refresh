import "server-only";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ONBOARDING_PATH } from "./auth-constants";
import { getScanActor, type ScanActor } from "./get-scan-actor";

export const requirePageActor = async (): Promise<ScanActor> => {
	const result = await getScanActor();
	if (result.ok) {
		return result.actor;
	}
	if (result.code === "UNAUTHORIZED") {
		const { redirectToSignIn } = await auth();
		return redirectToSignIn();
	}
	return redirect(ONBOARDING_PATH);
};
