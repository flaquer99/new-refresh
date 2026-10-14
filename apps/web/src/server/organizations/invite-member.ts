import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import {
	alreadyInOrganizationMessage,
	INITIAL_INVITE_STATE,
	INVALID_EMAIL_MESSAGE,
	INVALID_ROLE_MESSAGE,
	INVITE_FAILED_MESSAGE,
	type InviteMemberState,
	type InviteRole,
	inviteErrorState,
	NOT_ADMIN_MESSAGE,
	pendingInvitationMessage,
} from "@/lib/organizations/invite-member-state";
import type { ScanActor } from "../auth/get-scan-actor";
import { errorNameOf, logServerEvent } from "../log/server-log";
import { getAppOrigin } from "./app-origin";
import { isDuplicateInvitation, isRateLimited } from "./clerk-error";
import { hasOrganizationMembership } from "./has-organization-membership";
import { parseInviteEmail, parseInviteRole } from "./invite-input";

const JOIN_PATH = "/join";
const INVITE_FAILED_EVENT = "organization.invite_failed";

type InviteMemberParams = {
	actor: ScanActor;
	email: unknown;
	role: unknown;
};

type SendInvitationParams = {
	actor: ScanActor;
	email: string;
	role: InviteRole;
};

const failureState = (
	{ actor, email }: SendInvitationParams,
	error: unknown,
): InviteMemberState => {
	if (isDuplicateInvitation(error)) {
		return inviteErrorState({ fieldError: pendingInvitationMessage(email) });
	}
	logServerEvent("error", {
		event: INVITE_FAILED_EVENT,
		userId: actor.userId,
		organizationId: actor.organizationId,
		rateLimited: isRateLimited(error),
		error: errorNameOf(error),
	});
	return inviteErrorState({ formError: INVITE_FAILED_MESSAGE });
};

const sendInvitation = async (
	params: SendInvitationParams,
): Promise<InviteMemberState> => {
	const { actor, email, role } = params;
	try {
		if (await hasOrganizationMembership(email)) {
			return inviteErrorState({
				fieldError: alreadyInOrganizationMessage(email),
			});
		}
		const client = await clerkClient();
		await client.organizations.createOrganizationInvitation({
			organizationId: actor.organizationId,
			inviterUserId: actor.userId,
			emailAddress: email,
			role,
			redirectUrl: `${await getAppOrigin()}${JOIN_PATH}`,
		});
		return { ...INITIAL_INVITE_STATE, status: "sent", email };
	} catch (error) {
		return failureState(params, error);
	}
};

export const inviteMember = ({
	actor,
	email,
	role,
}: InviteMemberParams): Promise<InviteMemberState> => {
	if (actor.role !== "admin") {
		return Promise.resolve(inviteErrorState({ formError: NOT_ADMIN_MESSAGE }));
	}
	const parsedEmail = parseInviteEmail(email);
	if (parsedEmail === null) {
		return Promise.resolve(
			inviteErrorState({ fieldError: INVALID_EMAIL_MESSAGE }),
		);
	}
	const parsedRole = parseInviteRole(role);
	if (parsedRole === null) {
		return Promise.resolve(
			inviteErrorState({ formError: INVALID_ROLE_MESSAGE }),
		);
	}
	return sendInvitation({ actor, email: parsedEmail, role: parsedRole });
};
