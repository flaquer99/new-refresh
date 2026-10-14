import { clerkRequest } from "./clerk-api";

type ClerkUser = { id: string };
type ClerkInvitation = { email_address: string; url?: string };

export const deleteOrganization = async (id: string): Promise<void> => {
	await clerkRequest("DELETE", `/organizations/${id}`);
};

export const deleteOrganizationByName = async (name: string): Promise<void> => {
	const { data } = await clerkRequest<{ data: { id: string; name: string }[] }>(
		"GET",
		`/organizations?query=${encodeURIComponent(name)}`,
	);
	for (const organization of data.filter((item) => item.name === name)) {
		await deleteOrganization(organization.id);
	}
};

export const deleteUser = async (id: string): Promise<void> => {
	await clerkRequest("DELETE", `/users/${id}`);
};

export const deleteUserByEmail = async (email: string): Promise<void> => {
	const users = await clerkRequest<ClerkUser[]>(
		"GET",
		`/users?email_address=${encodeURIComponent(email)}`,
	);
	for (const user of users) {
		await deleteUser(user.id);
	}
};

export const findInvitationUrl = async (
	organizationId: string,
	email: string,
): Promise<string> => {
	const { data } = await clerkRequest<{ data: ClerkInvitation[] }>(
		"GET",
		`/organizations/${organizationId}/invitations?status=pending`,
	);
	const url = data.find(
		(invitation) => invitation.email_address === email,
	)?.url;
	if (!url) {
		throw new Error(`No pending invitation URL found for ${email}.`);
	}
	return url;
};
