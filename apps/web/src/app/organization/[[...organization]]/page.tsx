import { OrganizationProfile } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { InviteMemberForm } from "@/components/organization/invite-member-form";
import { ORGANIZATION_PATH } from "@/lib/auth/auth-paths";
import { ORGANIZATION_APPEARANCE } from "@/lib/auth/organization-appearance";
import { requirePageActor } from "@/server/auth/require-page-actor";

export const metadata: Metadata = { title: "Organization" };

export default async function OrganizationPage() {
	const actor = await requirePageActor();
	return (
		<AuthPageFrame title="Organization">
			{actor.role === "admin" ? <InviteMemberForm /> : null}
			<OrganizationProfile
				appearance={ORGANIZATION_APPEARANCE}
				path={ORGANIZATION_PATH}
				routing="path"
			/>
		</AuthPageFrame>
	);
}
