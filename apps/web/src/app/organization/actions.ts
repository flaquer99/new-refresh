"use server";

import {
	type InviteMemberState,
	inviteErrorState,
} from "@/lib/organizations/invite-member-state";
import {
	ORGANIZATION_REQUIRED_MESSAGE,
	UNAUTHORIZED_MESSAGE,
} from "@/server/auth/auth-constants";
import { getScanActor } from "@/server/auth/get-scan-actor";
import { inviteMember } from "@/server/organizations/invite-member";

export async function inviteMemberAction(
	_previous: InviteMemberState,
	formData: FormData,
): Promise<InviteMemberState> {
	const result = await getScanActor();
	if (!result.ok) {
		return inviteErrorState({
			formError:
				result.code === "UNAUTHORIZED"
					? UNAUTHORIZED_MESSAGE
					: ORGANIZATION_REQUIRED_MESSAGE,
		});
	}
	return inviteMember({
		actor: result.actor,
		email: formData.get("email"),
		role: formData.get("role"),
	});
}
