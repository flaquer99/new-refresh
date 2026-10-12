import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HudPanelProps = {
	children: ReactNode;
	title?: string;
	labelledBy?: string;
	className?: string;
};

const TICK_CLASSES = "absolute size-2 border-primary";

export function HudPanel({
	children,
	title,
	labelledBy,
	className,
}: HudPanelProps) {
	return (
		<section
			aria-labelledby={labelledBy}
			className={cn(
				"hud-frame relative flex flex-col gap-4 rounded-md bg-card p-4 text-card-foreground sm:p-6",
				className,
			)}
		>
			<span
				aria-hidden="true"
				className={cn(TICK_CLASSES, "top-0 left-0 border-t-2 border-l-2")}
			/>
			<span
				aria-hidden="true"
				className={cn(TICK_CLASSES, "right-0 bottom-0 border-r-2 border-b-2")}
			/>
			{title ? (
				<p className="font-mono text-muted-foreground text-xs uppercase tracking-widest">
					{title}
				</p>
			) : null}
			{children}
		</section>
	);
}
