"use client";

import { Button } from "@/components/ui/button";
import { useInviteMember } from "@/hooks/use-invite-member";
import { InviteMemberFields } from "./invite-member-fields";
import { InviteMemberMessages } from "./invite-member-messages";

const HEADING_ID = "invite-member-heading";

export function InviteMemberForm() {
	const { state, formAction, isPending } = useInviteMember();
	return (
		<form
			action={formAction}
			aria-labelledby={HEADING_ID}
			className="hud-frame flex w-full max-w-xl flex-col gap-4 rounded-md bg-card p-4 text-card-foreground sm:p-6"
		>
			<h2 className="font-semibold text-lg" id={HEADING_ID}>
				Invite a member
			</h2>
			<InviteMemberFields fieldError={state.fieldError} />
			<InviteMemberMessages
				email={state.email}
				formError={state.formError}
				status={state.status}
			/>
			<Button className="self-start" disabled={isPending} type="submit">
				{isPending ? "Sending invitation…" : "Send invitation"}
			</Button>
		</form>
	);
}
