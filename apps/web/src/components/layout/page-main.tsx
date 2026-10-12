import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MAIN_CONTENT_ID } from "./skip-link";

type PageMainProps = {
	children: ReactNode;
	labelledBy?: string;
	className?: string;
};

export function PageMain({ children, labelledBy, className }: PageMainProps) {
	return (
		<main
			aria-labelledby={labelledBy}
			className={cn(
				"mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 py-8 focus:outline-none sm:px-6 sm:py-12",
				className,
			)}
			id={MAIN_CONTENT_ID}
			tabIndex={-1}
		>
			{children}
		</main>
	);
}
