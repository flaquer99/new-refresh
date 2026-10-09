import type { Violation } from "@refresh/scan-contracts/findings";
import { useId } from "react";
import { CriteriaList } from "./criteria-list";
import { FindingDetails } from "./finding-details";
import { GuidanceBlock } from "./guidance-block";
import { SeverityBadge } from "./severity-badge";

type ViolationCardProps = {
	violation: Violation;
};

export function ViolationCard({ violation }: ViolationCardProps) {
	const headingId = useId();
	return (
		<article
			aria-labelledby={headingId}
			className="flex flex-col gap-3 rounded-lg border border-border p-4"
		>
			<h4 className="font-semibold" id={headingId}>
				{violation.description}
			</h4>
			<div className="flex flex-wrap items-center gap-2">
				<SeverityBadge severity={violation.severity} />
				<span className="text-sm">Level {violation.level}</span>
			</div>
			<CriteriaList criteria={violation.criteria} />
			<FindingDetails
				html={violation.html}
				pageUrl={violation.pageUrl}
				selector={violation.selector}
				viewports={violation.viewports}
			/>
			<GuidanceBlock text={violation.fixGuidance} title="How to fix" />
		</article>
	);
}
