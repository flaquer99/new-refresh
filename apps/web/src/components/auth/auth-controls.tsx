import { Show, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { OrganizationBadge } from "./organization-badge";
import { UserMenu } from "./user-menu";

export function AuthControls() {
	return (
		<>
			<Show when="signed-out">
				<SignInButton>
					<Button variant="outline">Sign in</Button>
				</SignInButton>
				<SignUpButton>
					<Button>Sign up</Button>
				</SignUpButton>
			</Show>
			<Show when="signed-in">
				<OrganizationBadge />
				<UserMenu />
			</Show>
		</>
	);
}
