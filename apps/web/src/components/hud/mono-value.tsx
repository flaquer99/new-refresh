import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type MonoValueProps = {
	children: ReactNode;
	className?: string;
};

export function MonoValue({ children, className }: MonoValueProps) {
	return (
		<span className={cn("break-all font-mono text-sm", className)}>
			{children}
		</span>
	);
}
