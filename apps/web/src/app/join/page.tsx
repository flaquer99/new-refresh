import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { OneOrganizationNotice } from "@/components/organization/one-organization-notice";
import { HOME_PATH, SIGN_IN_PATH } from "@/lib/auth/auth-paths";
import { ONBOARDING_PATH } from "@/server/auth/auth-constants";
import { getScanActor } from "@/server/auth/get-scan-actor";

export const metadata: Metadata = { title: "Join an organization" };

export default async function JoinPage() {
	const result = await getScanActor();
	if (result.ok) {
		return (
			<AuthPageFrame title="Join an organization">
				<OneOrganizationNotice />
			</AuthPageFrame>
		);
	}
	if (result.code === "ORGANIZATION_REQUIRED") {
		return redirect(ONBOARDING_PATH);
	}
	return (
		<AuthPageFrame title="Join an organization">
			<SignUp
				fallbackRedirectUrl={HOME_PATH}
				routing="hash"
				signInUrl={SIGN_IN_PATH}
			/>
		</AuthPageFrame>
	);
}
