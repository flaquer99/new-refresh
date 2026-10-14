import { useActionState } from "react";
import { inviteMemberAction } from "@/app/organization/actions";
import { INITIAL_INVITE_STATE } from "@/lib/organizations/invite-member-state";

export function useInviteMember() {
	const [state, formAction, isPending] = useActionState(
		inviteMemberAction,
		INITIAL_INVITE_STATE,
	);
	return { state, formAction, isPending };
}
