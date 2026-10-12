import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type HudStatTone = "critical" | "serious" | "moderate" | "minor";

type HudStatProps = {
	term: string;
	value: ReactNode;
	tone?: HudStatTone;
};

const TONE_CLASSES: Record<HudStatTone, string> = {
	critical: "text-severity-critical",
	serious: "text-severity-serious",
	moderate: "text-severity-moderate",
	minor: "text-severity-minor",
};

export function HudStat({ term, value, tone }: HudStatProps) {
	return (
		<div className="hud-frame flex flex-col gap-1 rounded-md bg-card p-3">
			<dt className="text-muted-foreground text-sm">{term}</dt>
			<dd
				className={cn(
					"font-mono font-semibold text-2xl",
					tone && TONE_CLASSES[tone],
				)}
			>
				{value}
			</dd>
		</div>
	);
}
