export type InviteMemberState = {
	status: "idle" | "sent" | "error";
	email: string | null;
	fieldError: string | null;
	formError: string | null;
};

export const INITIAL_INVITE_STATE: InviteMemberState = {
	status: "idle",
	email: null,
	fieldError: null,
	formError: null,
};

export const MEMBER_ROLE = "org:member";
export const ADMIN_ROLE = "org:admin";
export const INVITE_ROLES = [MEMBER_ROLE, ADMIN_ROLE] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

export const INVITE_ROLE_LABELS: Record<InviteRole, string> = {
	[MEMBER_ROLE]: "Member",
	[ADMIN_ROLE]: "Admin",
};

export const NOT_ADMIN_MESSAGE = "Only admins can invite members.";
export const INVALID_EMAIL_MESSAGE = "Enter a valid email address.";
export const INVALID_ROLE_MESSAGE = "Choose a valid role.";
export const INVITE_FAILED_MESSAGE =
	"Couldn't send the invitation. Try again in a minute.";

export const alreadyInOrganizationMessage = (email: string): string =>
	`${email} already belongs to another organization. A person can only belong to one organization.`;

export const pendingInvitationMessage = (email: string): string =>
	`${email} already has a pending invitation.`;

export const inviteErrorState = (
	details: Partial<Pick<InviteMemberState, "fieldError" | "formError">>,
): InviteMemberState => ({
	...INITIAL_INVITE_STATE,
	status: "error",
	...details,
});
