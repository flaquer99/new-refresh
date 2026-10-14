import type { InviteMemberState } from "@/lib/organizations/invite-member-state";

type InviteMemberMessagesProps = {
	status: InviteMemberState["status"];
	email: string | null;
	formError: string | null;
};

export function InviteMemberMessages({
	status,
	email,
	formError,
}: InviteMemberMessagesProps) {
	return (
		<>
			{status === "sent" ? (
				<p className="font-medium text-sm" role="status">
					Invitation sent to {email}.
				</p>
			) : null}
			{formError ? (
				<p className="font-medium text-destructive text-sm" role="alert">
					{formError}
				</p>
			) : null}
		</>
	);
}
