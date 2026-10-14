import type { ReviewItem } from "@refresh/scan-contracts/findings";
import { FindingPreview } from "@/components/preview/finding-preview";
import { CriteriaList } from "./criteria-list";
import { FindingDetails } from "./finding-details";
import { GuidanceBlock } from "./guidance-block";

export const NEEDS_REVIEW_CARD_CLASSES =
	"flex flex-col gap-3 rounded-md border border-needs-review border-dashed bg-transparent p-4";

type ReviewItemCardProps = {
	scanId: string;
	item: ReviewItem;
};

export function ReviewItemCard({ item, scanId }: ReviewItemCardProps) {
	const headingId = `review-${item.id}`;
	return (
		<article aria-labelledby={headingId} className={NEEDS_REVIEW_CARD_CLASSES}>
			<h4 className="font-heading font-semibold" id={headingId}>
				Check the “{item.ruleId}” result
			</h4>
			<CriteriaList criteria={item.criteria} />
			<FindingDetails
				html={item.html}
				pageUrl={item.pageUrl}
				selector={item.selector}
				viewports={item.viewports}
			/>
			<FindingPreview
				findingId={item.id}
				headingId={headingId}
				pageUrl={item.pageUrl}
				scanId={scanId}
				viewports={item.viewports}
			/>
			<GuidanceBlock text={item.guidance} title="What to check" />
		</article>
	);
}
