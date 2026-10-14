import type { ReactElement, ReactNode } from "react";

export const clerkView = {
	signedIn: false,
	organization: null as { name: string; imageUrl: string } | null,
};

export const resetClerkView = () => {
	clerkView.signedIn = false;
	clerkView.organization = null;
};

type ShowMockProps = {
	when: "signed-in" | "signed-out";
	children: ReactNode;
};

const Show = ({ when, children }: ShowMockProps): ReactNode => {
	const matches = (when === "signed-in") === clerkView.signedIn;
	return matches ? children : null;
};

const passThrough = ({ children }: { children: ReactElement }) => children;

const UserButton = Object.assign(
	({ children }: { children?: ReactNode }) => (
		<div data-testid="user-button">{children}</div>
	),
	{
		MenuItems: ({ children }: { children: ReactNode }) => <>{children}</>,
		Link: ({ label, href }: { label: string; href: string }) => (
			<span data-href={href}>{label}</span>
		),
	},
);

export const clerkComponentsMock = {
	Show,
	SignInButton: passThrough,
	SignUpButton: passThrough,
	UserButton,
	useOrganization: () => ({ organization: clerkView.organization }),
};
