import { randomBytes } from "node:crypto";
import { clerkRequest } from "./clerk-api";
import { E2E_USER_PASSWORD } from "./clerk-env";

export type TestUser = {
	id: string;
	email: string;
	firstName: string;
	lastName: string;
	fullName: string;
	organizationId: string | null;
};

export type TestOrganization = { id: string; name: string; slug: string };

type ClerkUser = { id: string };

const SUFFIX_BYTES = 4;
const FIRST_NAME = "E2E";
const MEMBER_ROLE = "org:member";

export const uniqueSuffix = (): string =>
	randomBytes(SUFFIX_BYTES).toString("hex");

export const testEmail = (label: string): string =>
	`e2e-${label}-${uniqueSuffix()}+clerk_test@example.com`;

export const createTestUser = async (
	label: string,
	lastName: string,
): Promise<TestUser> => {
	const email = testEmail(label);
	const user = await clerkRequest<ClerkUser>("POST", "/users", {
		email_address: [email],
		password: E2E_USER_PASSWORD,
		first_name: FIRST_NAME,
		last_name: lastName,
		skip_password_checks: true,
		skip_legal_checks: true,
	});
	return {
		id: user.id,
		email,
		firstName: FIRST_NAME,
		lastName,
		fullName: `${FIRST_NAME} ${lastName}`,
		organizationId: null,
	};
};

export const createOrganization = async (
	admin: TestUser,
	label: string,
): Promise<TestOrganization> => {
	const slug = `e2e-${label}-${uniqueSuffix()}`;
	const name = `E2E ${label} ${uniqueSuffix()}`;
	const organization = await clerkRequest<{ id: string }>(
		"POST",
		"/organizations",
		{ name, slug, created_by: admin.id },
	);
	return { id: organization.id, name, slug };
};

export const addMember = async (
	organizationId: string,
	user: TestUser,
): Promise<TestUser> => {
	await clerkRequest("POST", `/organizations/${organizationId}/memberships`, {
		user_id: user.id,
		role: MEMBER_ROLE,
	});
	return { ...user, organizationId };
};
