import type { Violation } from "@refresh/scan-contracts/findings";
import { useId } from "react";
import { FindingPreview } from "@/components/preview/finding-preview";
import { Card } from "@/components/ui/card";
import { CriteriaList } from "./criteria-list";
import { FindingDetails } from "./finding-details";
import { GuidanceBlock } from "./guidance-block";
import { SeverityBadge } from "./severity-badge";

type ViolationCardProps = {
	scanId: string;
	violation: Violation;
};

export function ViolationCard({ violation, scanId }: ViolationCardProps) {
	const headingId = useId();
	return (
		<article aria-labelledby={headingId}>
			<Card className="gap-3 p-4" size="sm">
				<h4 className="font-heading font-semibold" id={headingId}>
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
				<FindingPreview
					findingId={violation.id}
					headingId={headingId}
					pageUrl={violation.pageUrl}
					scanId={scanId}
					viewports={violation.viewports}
				/>
				<GuidanceBlock text={violation.fixGuidance} title="How to fix" />
			</Card>
		</article>
	);
}
