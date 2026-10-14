import { SignUp } from "@clerk/nextjs";
import type { Metadata } from "next";
import { AuthPageFrame } from "@/components/auth/auth-page-frame";
import { HOME_PATH, SIGN_IN_PATH, SIGN_UP_PATH } from "@/lib/auth/auth-paths";

export const metadata: Metadata = { title: "Sign up" };

export default function SignUpPage() {
	return (
		<AuthPageFrame title="Sign up">
			<SignUp
				fallbackRedirectUrl={HOME_PATH}
				path={SIGN_UP_PATH}
				routing="path"
				signInUrl={SIGN_IN_PATH}
			/>
		</AuthPageFrame>
	);
}
