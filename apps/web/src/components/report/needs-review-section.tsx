import type { ManualCheck, ReviewItem } from "@refresh/scan-contracts/findings";
import { ManualCheckList } from "./manual-check-list";
import { ReviewList } from "./review-list";

const HEADING_ID = "needs-review-heading";

type NeedsReviewSectionProps = {
	reviewItems: readonly ReviewItem[];
	manualChecks: readonly ManualCheck[];
};

export function NeedsReviewSection({
	reviewItems,
	manualChecks,
}: NeedsReviewSectionProps) {
	return (
		<section aria-labelledby={HEADING_ID} className="flex flex-col gap-4">
			<h2 className="font-semibold text-xl" id={HEADING_ID}>
				Needs review
			</h2>
			<p className="text-muted-foreground">
				These success criteria need human judgment. Check each one by hand.
			</p>
			<ReviewList items={reviewItems} />
			<ManualCheckList checks={manualChecks} />
		</section>
	);
}
