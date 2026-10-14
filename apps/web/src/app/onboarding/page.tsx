import { TaskChooseOrganization } from "@clerk/nextjs";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { HOME_PATH } from "@/lib/auth/auth-paths";
import { getScanActor } from "@/server/auth/get-scan-actor";
import { requireSignedIn } from "@/server/auth/require-signed-in";

export const metadata: Metadata = { title: "Choose your organization" };

export default async function OnboardingPage() {
	await requireSignedIn();
	const result = await getScanActor();
	if (result.ok) {
		return redirect(HOME_PATH);
	}
	return (
		<AuthPageFrame title="Choose your organization">
			<TaskChooseOrganization redirectUrlComplete={HOME_PATH} />
		</AuthPageFrame>
	);
}
