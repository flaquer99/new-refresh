import { SEVERITIES } from "@refresh/scan-contracts/findings";
import { SEVERITY_LABELS, SEVERITY_SYMBOLS } from "@/lib/report/severity";
import type { ViolationsBySeverity } from "@/server/scans/scan-read-models";

type SeverityCountsProps = {
	counts: ViolationsBySeverity;
};

export function SeverityCounts({ counts }: SeverityCountsProps) {
	return (
		<ul className="flex flex-wrap gap-x-3 gap-y-1">
			{SEVERITIES.map((severity) => (
				<li key={severity}>
					<span aria-hidden="true">{SEVERITY_SYMBOLS[severity]} </span>
					{counts[severity]} {SEVERITY_LABELS[severity].toLowerCase()}
				</li>
			))}
		</ul>
	);
}
