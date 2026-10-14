import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { HOME_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/auth/auth-paths";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
	return (
		<AuthPageFrame title="Sign in">
			<SignIn
				fallbackRedirectUrl={HOME_PATH}
				path={SIGN_IN_PATH}
				routing="path"
				signUpUrl={SIGN_UP_PATH}
			/>
		</AuthPageFrame>
	);
}
