import type { ManualCheck, ReviewItem } from "@refresh/scan-contracts/findings";
import { ManualCheckList } from "./manual-check-list";
import { ReviewList } from "./review-list";

const HEADING_ID = "needs-review-heading";

type NeedsReviewSectionProps = {
	scanId: string;
	reviewItems: readonly ReviewItem[];
	manualChecks: readonly ManualCheck[];
};

export function NeedsReviewSection({
	reviewItems,
	manualChecks,
	scanId,
}: NeedsReviewSectionProps) {
	return (
		<section
			aria-labelledby={HEADING_ID}
			className="flex flex-col gap-4 border-needs-review border-t pt-6"
		>
			<h2 className="font-heading font-semibold text-xl" id={HEADING_ID}>
				Needs review
			</h2>
			<p className="text-muted-foreground">
				These success criteria need human judgment. Check each one by hand.
			</p>
			<ReviewList items={reviewItems} scanId={scanId} />
			<ManualCheckList checks={manualChecks} />
		</section>
	);
}
