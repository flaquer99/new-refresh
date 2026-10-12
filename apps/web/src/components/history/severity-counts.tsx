import { SEVERITIES, type Severity } from "@refresh/scan-contracts/findings";
import { Badge } from "@/components/ui/badge";
import { SEVERITY_LABELS, SEVERITY_SYMBOLS } from "@/lib/report/severity";
import type { ViolationsBySeverity } from "@/server/scans/scan-read-models";

const SYMBOL_CLASSES: Record<Severity, string> = {
	critical: "text-severity-critical",
	serious: "text-severity-serious",
	moderate: "text-severity-moderate",
	minor: "text-severity-minor",
};

type SeverityCountsProps = {
	counts: ViolationsBySeverity;
};

export function SeverityCounts({ counts }: SeverityCountsProps) {
	return (
		<ul className="flex flex-wrap gap-2">
			{SEVERITIES.map((severity) => (
				<li key={severity}>
					<Badge className="h-6 font-mono" variant="outline">
						<span aria-hidden="true" className={SYMBOL_CLASSES[severity]}>
							{SEVERITY_SYMBOLS[severity]}
						</span>
						{counts[severity]} {SEVERITY_LABELS[severity].toLowerCase()}
					</Badge>
				</li>
			))}
		</ul>
	);
}
