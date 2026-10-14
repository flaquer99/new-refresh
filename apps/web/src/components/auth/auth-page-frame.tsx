import type { ReactNode } from "react";
import { PageMain } from "@/components/layout/page-main";

const HEADING_ID = "auth-page-heading";

type AuthPageFrameProps = {
	title: string;
	children: ReactNode;
};

export function AuthPageFrame({ title, children }: AuthPageFrameProps) {
	return (
		<PageMain className="items-center" labelledBy={HEADING_ID}>
			<h1 className="sr-only" id={HEADING_ID}>
				{title}
			</h1>
			{children}
		</PageMain>
	);
}
