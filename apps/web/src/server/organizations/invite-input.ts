import { z } from "zod";
import {
	INVITE_ROLES,
	type InviteRole,
	MEMBER_ROLE,
} from "@/lib/organizations/invite-member-state";

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());
const roleSchema = z.enum(INVITE_ROLES);

export const parseInviteEmail = (value: unknown): string | null => {
	const parsed = emailSchema.safeParse(value);
	return parsed.success ? parsed.data : null;
};

export const parseInviteRole = (value: unknown): InviteRole | null => {
	const parsed = roleSchema.safeParse(value ?? MEMBER_ROLE);
	return parsed.success ? parsed.data : null;
};
