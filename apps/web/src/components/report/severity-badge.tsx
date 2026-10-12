import type { Severity } from "@refresh/scan-contracts/findings";
import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABELS, SEVERITY_SYMBOLS } from "@/lib/report/severity";
import { cn } from "@/lib/utils";

const SEVERITY_CLASSES: Record<Severity, string> = {
	critical: "border-severity-critical text-severity-critical",
	serious: "border-severity-serious text-severity-serious",
	moderate: "border-severity-moderate text-severity-moderate",
	minor: "border-severity-minor text-severity-minor",
};

type SeverityBadgeProps = {
	severity: Severity;
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
	return (
		<Badge
			className={cn(
				"h-auto bg-transparent text-sm",
				SEVERITY_CLASSES[severity],
			)}
			variant="outline"
		>
			<span aria-hidden="true">{SEVERITY_SYMBOLS[severity]}</span>
			<span className="sr-only">Severity: </span>
			{SEVERITY_LABELS[severity]}
		</Badge>
	);
}
