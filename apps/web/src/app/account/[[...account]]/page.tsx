import { UserProfile } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { ACCOUNT_PATH } from "@/lib/auth/auth-paths";
import { requireSignedIn } from "@/server/auth/require-signed-in";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
	await requireSignedIn();
	return (
		<AuthPageFrame title="Account">
			<UserProfile path={ACCOUNT_PATH} routing="path" />
		</AuthPageFrame>
	);
}
