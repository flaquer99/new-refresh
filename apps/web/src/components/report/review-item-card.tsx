import type { ReviewItem } from "@refresh/scan-contracts/findings";
import { CriteriaList } from "./criteria-list";
import { FindingDetails } from "./finding-details";
import { GuidanceBlock } from "./guidance-block";

type ReviewItemCardProps = {
	item: ReviewItem;
};

export function ReviewItemCard({ item }: ReviewItemCardProps) {
	const headingId = `review-${item.id}`;
	return (
		<article
			aria-labelledby={headingId}
			className="flex flex-col gap-3 rounded-lg border border-border p-4"
		>
			<h4 className="font-semibold" id={headingId}>
				Check the “{item.ruleId}” result
			</h4>
			<CriteriaList criteria={item.criteria} />
			<FindingDetails
				html={item.html}
				pageUrl={item.pageUrl}
				selector={item.selector}
				viewports={item.viewports}
			/>
			<GuidanceBlock text={item.guidance} title="What to check" />
		</article>
	);
}
